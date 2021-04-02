import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { History } from './pages/History';
import { Home } from './pages/Home';

export const Routes = () => (
  <Switch>
    <Route exact path="/bridge" component={Home} />
    <Route exact path="/history" component={History} />
    <Redirect to="/bridge" />
  </Switch>
);
