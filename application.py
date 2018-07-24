import os

from flask import Flask, jsonify, render_template, request, Response
from flask_socketio import SocketIO, emit
import json
from datetime import datetime


app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

class Message:
  def __init__(self, user, time, text):
    self.user = user
    self.time = time
    self.text = text


# list of all channels
channelList = ['general']



#list of messages
channelMessages = {}
for channel in channelList:
    channelMessages[channel] = [Message("Server", str(datetime.now()), "Welcome to Channel:" + channel)]

#list of Users:
users = ['lily', 'Rose']

userMessages = {}
for user in users:
    userMessages[user] = [Message("Server", str(datetime.now()), "Welcome")]


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/channel", methods=["POST", "GET"])
def chInquiry():
    if request.method == 'GET':
        print ("GET Channel-> Getting channel list from server")
        return json.dumps(channelList)


    if request.method == 'POST':
        print ("POST Channel-> Storing new channel list INTO server")
        jsonData = request.get_json();
        print (jsonData)
        channel = jsonData['channelName']
        channelMessages[channel] = []
        channelList.append(channel)
        channelMessages[channel].append(Message("Server", str(datetime.now()), "Welcome to Channel:" + channel))
        print(channelMessages[channel])
        return json.dumps(channelList)


@app.route("/load", methods=["POST"])
def loadChannel():
    print ("Hi from LOAD Channel Page")
    jsonData = request.get_json();
    print (jsonData)
    channel = jsonData['channelName']
    messageResponse = []
    if channel in channelList:
        for message in channelMessages[channel]:
            messageResponse.append(json.dumps(message.__dict__))
        print(messageResponse)
    return json.dumps(messageResponse)

@app.route("/loadUsers", methods=["POST"])
def loadUsers():
    print ("Hi from LOAD Users Page")
    jsonData = request.get_json();
    print (jsonData)
    username = jsonData['username']
    if username not in users:
        users.append(username)
        return json.dumps(users)
    else:
        return json.dumps(users)



@socketio.on("submit message")
def channelServer(data):
    print ("Hi from socketio")
    print (data)
    chname = data["channelName"]
    print(chname)
    message = data["message"]
    print(message)
    messageResponse = []
    if chname in channelList:
        messageObj = Message(message["username"], message["time"], message["text"])
        channelMessages[chname].append(messageObj)
        dicLen = channelMessages[chname]
        count = 0
        while(len(dicLen)>100):
            del channelMessages[chname][count]
        messageResponse.append(json.dumps(messageObj.__dict__))
    emit("announce message", json.dumps(messageResponse) , broadcast=True)


@socketio.on("directMessage")
def userServer(directData):
    print ("Hi from USER socketio")
    print (directData)
    usrname = directData["userName"]
    print(usrname)
    message = directData["message"]
    print(message)
    messageResponse = []
    if usrname in users:
        messageObj = Message(message["username"], message["time"], message["text"])
        userMessages[usrname].append(messageObj)
        dicLen = userMessages[usrname]
        count = 0
        while(len(dicLen)>100):
            del userMessages[usrname][count]
        messageResponse.append(json.dumps(messageObj.__dict__))
    emit("announce directMessage", json.dumps(messageResponse) , broadcast=True)
