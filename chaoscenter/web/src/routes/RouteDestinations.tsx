import React, { useEffect } from 'react';
import { Redirect, Route, Switch, useHistory } from 'react-router-dom';
import { useLogout, useRouteDefinitionsMatch, useRouteWithBaseUrl } from '@hooks';
import { GenericErrorHandler } from '@errors';
import OverviewController from '@controllers/Overview';
import ChaosStudioCreateController from '@controllers/ChaosStudioCreate';
import ChaosStudioEditController from '@controllers/ChaosStudioEdit';
import ExperimentDashboardV2Controller from '@controllers/ExperimentDashboardV2';
import ExperimentRunHistoryController from '@controllers/ExperimentRunHistory';
import ExperimentRunDetailsController from '@controllers/ExperimentRunDetails';
import ChaosStudioCloneController from '@controllers/ChaosStudioClone';
import LoginController from '@controllers/Login';
import { getUserDetails } from '@utils';
import { isUserAuthenticated } from 'utils/auth';

const experimentID = ':experimentID';
const runID = ':runID';
const experimentKey = ':experimentKey';
const notifyID = ':notifyID';

export function RoutesWithAuthentication(): React.ReactElement {
  const matchPaths = useRouteDefinitionsMatch();
  const renderPaths = useRouteWithBaseUrl();
  const { forceLogout } = useLogout();
  const { token } = getUserDetails();

  useEffect(() => {
    if (!token || !isUserAuthenticated()) {
      forceLogout();
    }
  }, [forceLogout, token]);

  return (
    <Switch>
      <Redirect exact from={matchPaths.toRoot()} to={renderPaths.toDashboard()} />
      <Route exact path={matchPaths.toDashboard()} component={OverviewController} />
      {/* Chaos Experiments */}
      <Route exact path={matchPaths.toExperiments()} component={ExperimentDashboardV2Controller} />
      <Route exact path={matchPaths.toNewExperiment({ experimentKey })} component={ChaosStudioCreateController} />
      <Route exact path={matchPaths.toEditExperiment({ experimentKey })} component={ChaosStudioEditController} />
      <Route exact path={matchPaths.toCloneExperiment({ experimentKey })} component={ChaosStudioCloneController} />
      <Route
        exact
        path={matchPaths.toExperimentRunHistory({ experimentID })}
        component={ExperimentRunHistoryController}
      />
      <Route
        exact
        path={matchPaths.toExperimentRunDetails({ experimentID, runID })}
        component={ExperimentRunDetailsController}
      />
      <Route
        exact
        path={matchPaths.toExperimentRunDetailsViaNotifyID({ experimentID, notifyID })}
        component={ExperimentRunDetailsController}
      />
    </Switch>
  );
}

export function RoutesWithoutAuthentication(): React.ReactElement {
  const matchPaths = useRouteDefinitionsMatch();
  const renderPaths = useRouteWithBaseUrl();
  const { token, projectID } = getUserDetails();
  const history = useHistory();

  React.useEffect(() => {
    if (token && isUserAuthenticated()) {
      history.push(`/project/${projectID}${renderPaths.toDashboard()}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectID, token]);

  return (
    <Switch>
      <Redirect exact from={matchPaths.toRoot()} to={renderPaths.toLogin()} />
      <Route exact path={matchPaths.toLogin()} component={LoginController} />
      <Route path="*" component={GenericErrorHandler} />
    </Switch>
  );
}