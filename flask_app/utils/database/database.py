import mysql.connector
import glob
import json
import csv
from io import StringIO
import itertools
import hashlib
import os
import cryptography
from cryptography.fernet import Fernet
from math import pow

class database:

    def __init__(self, purge = False):

        # Grab information from the configuration file
        self.database       = 'db'
        self.host           = '127.0.0.1'
        self.user           = 'master'
        self.port           = 3306
        self.password       = 'master'
        self.tables         = ['boards', 'cards', 'lists', 'permissions','users']
        
        # NEW IN HW 3-----------------------------------------------------------------
        self.encryption     =  {   'oneway': {'salt' : b'averysaltysailortookalongwalkoffashortbridge',
                                                 'n' : int(pow(2,5)),
                                                 'r' : 9,
                                                 'p' : 1
                                             },
                                'reversible': { 'key' : '7pK_fnSKIjZKuv_Gwc--sZEMKn2zc8VvD6zS96XcNHE='}
                                }
        #-----------------------------------------------------------------------------

    def query(self, query = "SELECT * FROM users", parameters = None):

        cnx = mysql.connector.connect(host     = self.host,
                                      user     = self.user,
                                      password = self.password,
                                      port     = self.port,
                                      database = self.database,
                                      charset  = 'latin1'
                                     )


        if parameters is not None:
            cur = cnx.cursor(dictionary=True)
            cur.execute(query, parameters)
        else:
            cur = cnx.cursor(dictionary=True)
            cur.execute(query)

        # Fetch one result
        row = cur.fetchall()
        cnx.commit()

        if "INSERT" in query:
            cur.execute("SELECT LAST_INSERT_ID()")
            row = cur.fetchall()
            cnx.commit()
        cur.close()
        cnx.close()
        return row
    
    def createTables(self, purge=False, command_path="flask_app/database/"):
        with open(command_path + "create_tables/users.sql", 'r') as file:
            createUsers = file.read()
        with open(command_path + "create_tables/permissions.sql", 'r') as file:
            createPermissions = file.read()
        with open(command_path + "create_tables/boards.sql", 'r') as file:
            createBoards = file.read()
        with open(command_path + "create_tables/lists.sql") as file:
            createLists = file.read()
        with open(command_path + "create_tables/cards.sql") as file:
            createCards = file.read()
        
        self.query(createUsers)
        self.query(createBoards)
        self.query(createPermissions)
        self.query(createLists)
        self.query(createCards)

    def createUser(self, email="owner@email.com", password="password"):
        selectCommand = """
        SELECT * FROM users
        WHERE email = %s
        """

        if self.query(selectCommand, parameters=[email]):
            return "User Already Exists."

        insertCommand = """
        INSERT INTO users (email, password)
        VALUES (%s, %s);
        """

        userId = self.query(insertCommand, parameters=[email, self.onewayEncrypt(password)])[0]['LAST_INSERT_ID()']

        selectCommand = """
        SELECT * FROM users
        WHERE user_id = %s
        """

        return self.query(selectCommand, parameters=[userId])
    
    def createBoard(self, board_name="Untitled", board_description="This is a board."):
        insertCommand = """
        INSERT INTO boards (name, description)
        VALUE (%s, %s);
        """
        boardId = self.query(insertCommand, parameters=[board_name, board_description])[0]['LAST_INSERT_ID()']

        listNames = ["To Do", "Doing", "Completed"]

        for i in range(len(listNames)):
            insertCommand = """
            INSERT INTO lists (board_id, name)
            VALUES (%s, %s)
            """

            self.query(insertCommand, parameters=[boardId, listNames[i]])

        selectCommand = """
        SELECT * FROM boards
        WHERE board_id = %s
        """

        return self.query(selectCommand, parameters=[boardId])
    
    def authenticate(self, email="owner@email.com", password="password"):
        selectCommand = """
        SELECT * FROM users
        WHERE email = %s AND password = %s
        """
        return self.query(selectCommand, parameters=[email, self.onewayEncrypt(password)])
    
    def getBoardData(self, userId):
        result = []
        
        selectCommand = """
        SELECT * FROM permissions
        WHERE user_id = %s
        """

        permissions = self.query(selectCommand, parameters=[userId])
        boards = []

        for i in range(len(permissions)):
            selectCommand = """
            SELECT * FROM permissions
            WHERE board_id = %s
            """

            boards.append(self.query(selectCommand, parameters=[permissions[i]['board_id']])[0]['board_id'])
        
        print(boards)

        for i in range(len(boards)):
            boardId = boards[i]

            selectCommand = """
            SELECT * FROM boards
            WHERE board_id = %s
            """

            board = self.query(selectCommand, parameters=[boardId])
            result.append(board[0])
        
        return result
    
    def createPermission(self, userEmail, boardId, role):
        selectCommand = """
        SELECT * FROM users
        WHERE email = %s
        """

        userId = self.query(selectCommand, parameters=[userEmail])[0]['user_id']

        insertCommand = """
        INSERT INTO permissions (user_id, board_id, role)
        VALUES (%s, %s, %s);
        """

        self.query(insertCommand, parameters=[userId, boardId, role])
    
    def createCard(self, listId, cardName, cardDescription):
        listId = int(listId)
        insertCommand = """
        INSERT INTO cards (list_id, name, description)
        VALUES (%s, %s, %s)
        """

        cardId = self.query(insertCommand, parameters=[listId, cardName, cardDescription])[0]['LAST_INSERT_ID()']

        selectCommand = """
        SELECT * FROM cards
        WHERE card_id = %s
        """

        return self.query(selectCommand, parameters=[cardId])[0]

    def getListsData(self, board_id):
        listIds = dict({})

        selectCommand = """
        SELECT * FROM lists
        WHERE board_id = %s
        """

        lists = self.query(selectCommand, parameters=[board_id])

        for i in range(len(lists)):
            listIds[lists[i]['list_id']] = dict({'list_data': lists[i], 'cards_data': []})

            selectCommand = """
            SELECT * FROM cards
            WHERE list_id = %s
            """

            cards = self.query(selectCommand, parameters=[lists[i]['list_id']])
            listIds[lists[i]['list_id']]['cards_data'] = cards
        
        return listIds
    
    def changeCardList(self, cardId, targetListId):
        updateCommand = """
        UPDATE cards
        SET list_id = %s
        WHERE card_id = %s
        """

        self.query(updateCommand, parameters=[targetListId, cardId])
    
    def changeCardInfo(self, cardId, newName, newDescription):
        updateCommand = """
        UPDATE cards
        SET name = %s, description = %s
        WHERE card_id = %s
        """

        self.query(updateCommand, parameters=[newName, newDescription, cardId])

    def deleteCard(self, cardId):
        deleteCommand = """
        DELETE FROM cards
        WHERE card_id = %s
        """

        self.query(deleteCommand, parameters=[cardId])

    def clearData(self):
        self.query("""DELETE FROM permissions""")
        self.query("""DELETE FROM users""")
        self.query("""DELETE FROM cards""")
        self.query("""DELETE FROM lists""")
        self.query("""DELETE FROM boards""")
    
    def onewayEncrypt(self, string):
        encrypted_string = hashlib.scrypt(string.encode('utf-8'),
                                          salt = self.encryption['oneway']['salt'],
                                          n    = self.encryption['oneway']['n'],
                                          r    = self.encryption['oneway']['r'],
                                          p    = self.encryption['oneway']['p']
                                          ).hex()
        return encrypted_string

    def reversibleEncrypt(self, type, message):
        fernet = Fernet(self.encryption['reversible']['key'])
        
        if type == 'encrypt':
            message = fernet.encrypt(message.encode())
        elif type == 'decrypt':
            message = fernet.decrypt(message).decode()

        return message