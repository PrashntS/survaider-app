#!/usr/bin/env python
# -*- coding: utf-8 -*-
#.--. .-. ... .... -. - ... .-.-.- .. -.

from flask import Flask, Blueprint, render_template, request, jsonify

from . import model as user_model

usr = Blueprint('usr', __name__, template_folder='templates')

@usr.route('/:name')
def get(name):
    return "Name" + name

@usr.route('/login/web', methods = ['POST'])
@user_model.must_not_login
def login_web():
    if all([
        'user_name' in request.form,
        'password'  in request.form
    ]):
        user_name = request.form['user_name']
        password = request.form['password']
        res = user_model.Session.login(user_name, pswd = password)
        if res[0] is True:
            "Logged in, send the tokens back. Also, set the cookie"
            response = {
                'error': False,
                'user_id': res[1],
                'user_key': res[2]
            }
            return jsonify(response), 200
        else:
            "Nope, couldnt login. Error."
            response = {
                'error': True,
                'message': "Authentication Error"
            }
            return jsonify(response), 401

    response = {
        'error': True,
        'message': "Missing `user_name` | `password`"
    }
    return jsonify(response), 400

@usr.route('/login/social', methods = ['GET', 'POST'])
@user_model.must_not_login
def login_social():
    if all([
        'social_id' in request.form,
        'social_token' in request.form,
        'social_scope' in request.form
    ]):
        res = user_model.Session.login(
            social = True,
            social_id = request.form['social_id'],
            social_token = request.form['social_token'],
            social_scope = request.form['social_scope']
        )
        if res[0] is True:
            response = {
                'error': False,
                'user_id': res[1],
                'user_token': res[2]
            }
    response = {
        'error': True,
        'message': "Missing `user_id` | `user_token` | `scope`"
    }
    return jsonify(response), 400

@usr.route('/logout', methods = ['GET'])
@user_model.must_login
def logout():
    res = user_model.Session.logout(
        request.headers.get("user_id", ""),
        request.headers.get("user_key", "")
    )
    if res is True:
        response = {
            'error': False
        }
        return jsonify(response), 200
    else:
        response = {
            'error': True,
            'message': "Session Error, or already logged out."
        }
        return jsonify(response), 401

@usr.route('/signup', methods = ['POST'])
@user_model.must_not_login
def signup():
    if all([
        'user_name' in request.form,
        'password'  in request.form,
        'confirm_password' in request.form,
        'email_id'  in request.form
    ]):
        res = user_model.Manage.add(
            request.form['user_name'],
            request.form['password'],
            request.form['confirm_password'],
            request.form['email_id'],
        )
        if res[0] is True:
            response = {
                'error': False,
                'next': "Confirm Email."
            }
            return jsonify(response), 200
        else:
            response = {
                'error': True,
                'errors': res[1]
            }
            return jsonify(response), 400

    response = {
        'error': True,
        'message': "Missing `user_name` | `password` | `confirm_password` | `email_id`"
    }
    return jsonify(response), 400

@usr.route('/validate/email', methods = ['GET', 'POST'])
#@user_model.must_login
def validate_email():
    if request.method == 'GET':
        "Check request data"
        if 'q' in request.args:
            return "Proceed"
        else:
            return "NO"
        pass
    elif request.method == 'POST':
        "Initialize the validation process"
        if all([
            'email' in request.form
        ]):
            pass

    return jsonify(request.args), 200
