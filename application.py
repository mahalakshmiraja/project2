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
channelList = ['general','direct']

#list of messages
channelMessages = {}
for channel in channelList:
    channelMessages[channel] = [Message("Server", str(datetime.now()), "Welcome to Channel:" + channel)]

#list of Users:
users = ['maha']

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/channel", methods=["POST", "GET"])
def first():
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


@socketio.on("submit message")
def vote(data):
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
        messageResponse.append(json.dumps(messageObj.__dict__))
    emit("announce message", json.dumps(messageResponse) , broadcast=True)
