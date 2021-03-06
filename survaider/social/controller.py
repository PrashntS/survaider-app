#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#.--. .-. ... .... -. - ... .-.-.- .. -.

from flask.ext.social import Social
from flask.ext.social.datastore import MongoEngineConnectionDatastore
from flask.ext.social import connection_created, connection_failed, connection_removed, login_failed, login_completed

from survaider import db, app
from survaider.social.model import Connection, Routines
from survaider.dashboard.controller import dashboard, dashboard_home

social = Social(app, MongoEngineConnectionDatastore(db, Connection))

@connection_created.connect_via(app)
def on_connection_created(**kwargs):
    app.logger.debug('Connection Created')

@connection_failed.connect_via(app)
def on_connection_failed(**kwargs):
    app.logger.debug('Connection Failed')

@connection_removed.connect_via(app)
def on_connection_removed(**kwargs):
    app.logger.debug('Connection Removed')

@login_failed.connect_via(app)
def on_login_failed(sender, **kwargs):
    app.logger.debug('Login Failed')
    Routines.register_new_user(**kwargs)
    return dashboard_home()

@login_completed.connect_via(app)
def on_login_completed(sender, **kwargs):
    app.logger.debug('Login Complete')
    app.logger.debug(dir(kwargs))
