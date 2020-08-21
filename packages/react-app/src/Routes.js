import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";

import { Home } from "./pages/Home";
import { History } from "./pages/History";

export const Routes = () => (
    <Switch>
        <Route exact path="/">
            <Home />
        </Route>
        <Route path="/history">
            <History />
        </Route>
        <Redirect to="/" />
    </Switch>
);
