#!/usr/bin/env python
# -*- coding: utf-8 -*-
#.--. .-. ... .... -. - ... .-.-.- .. -.

from flask import Flask, Blueprint, render_template, request, jsonify

from user import model as user_model
from . import model as game_model

game = Blueprint('game', __name__, template_folder='templates')

@game.route('/')
def get():
    
    return game_model._Utils.encode('prashant', 'test', 45)