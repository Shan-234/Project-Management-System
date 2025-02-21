# Author: Shantanu Ingalagi <ingalag1@msu.edu>
from flask import current_app as app
from flask import render_template, redirect, request, session, url_for, copy_current_request_context
from flask_socketio import SocketIO, emit, join_room, leave_room, close_room, rooms, disconnect
from .utils.database.database  import database
from werkzeug.datastructures   import ImmutableMultiDict
from pprint import pprint
import json
import random
import functools
from flask_app import socketio

db = database()

def getUser():
    if 'email' in session:
        return db.reversibleEncrypt('decrypt', session['email'])
    return "Unknown"

@app.route('/')
def root():
    return redirect('/home')

@app.route('/home')
def home():
    return render_template('home.html', user_email=getUser())

@app.route('/sign_in')
def sign_in():
    return render_template('sign_in.html', user_email=getUser())

@app.route('/boards')
def boards():
    if 'email' not in session:
        return redirect('/sign_in')
    
    boardsData = db.getBoardData(session['id'])
    return render_template('board_list.html', user_email=getUser(), boardsData=boardsData)

@app.route('/sign_up')
def sign_up():
    return render_template('sign_up.html')

@app.route('/process_sign_up', methods=['POST'])
def process_sign_up():
    data = request.json
    return db.createUser(email=data['email'], password=data['password'])

@app.route('/process_sign_in', methods=['POST'])
def process_sign_in():
    data = request.json
    authenticationData = db.authenticate(data['email'], data['password'])

    if authenticationData:
        session['email'] = db.reversibleEncrypt('encrypt', data['email'])
        session['id'] = authenticationData[0]['user_id']
        pprint(session)
        return {'success': 1}
    return {'reject': 0}

@app.route('/add_board', methods=['POST'])
def add_board():
    data = request.json
    boardData = db.createBoard(board_name=data['name'], board_description=data['description'])
    db.createPermission(userEmail=getUser(), boardId=boardData[0]['board_id'], role='creator')

    for i in range(len(data['users'])):
        db.createPermission(userEmail=data['users'][i], boardId=boardData[0]['board_id'], role='editor')

    return boardData

@app.route('/sign_out')
def sign_out():
    session.clear()
    return redirect('/home')

@app.route('/boards/<board_id>')
def display_board(board_id):
    id = board_id[6:len(board_id)]
    id = int(id)
    listsData = db.getListsData(id)
    pprint(listsData)
    return render_template('board.html', user_email=getUser(), lists_data=listsData)

@socketio.on('joined')
def joined(board_id):
    join_room('main')

    emit('display_joined',
         {
            'msg': getUser() + " has entered the board."
         },
         room='main')

@socketio.on('add_card')
def add_card(data):
    cardData = db.createCard(data['list_id'], data['name'], data['description'])
    cardData['list_id'] = data['list_id']
    emit('display_card', cardData, room='main')

@socketio.on('change_list')
def change_list(data):
    targetListId = data['target_list_id']
    cardId = data['card_id']

    targetListId = int(targetListId)
    cardId = int(cardId)

    db.changeCardList(cardId, targetListId)
    emit('display_list_change', data, room='main', include_self=False)

@socketio.on('change_card_info')
def change_card_info(data):
    cardId = int(data['card_id'])
    db.changeCardInfo(cardId, data['name'], data['description'])
    emit('display_info_change', data, room='main', include_self=False)

@socketio.on('delete_card')
def delete_card(data):
    cardId = int(data['card_id'])
    db.deleteCard(cardId)
    emit('display_delete', data, room='main')

@socketio.on('send_message')
def send_message(data):
    emit('receive_message', data, room='main', include_self=False)