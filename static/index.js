let channel, username;

function loadPage() {
    let messagesElement = document.querySelector('#messages');
    while (messagesElement.firstChild) {
        messagesElement.removeChild(messagesElement.firstChild);
    }
    channel = document.getElementById("mySelect").value;
    localStorage.setItem('channel', channel);
    const request = new XMLHttpRequest();
    request.open('POST', "/load");
    request.setRequestHeader("Content-Type", "application/json");
    request.onload = () => {
        const response = request.responseText;
        const messages = JSON.parse(response);
        messages.forEach((message) => {
            let messageJson = JSON.parse(message);
            let p = document.createElement("p");
            name = messageJson.user;
            txt = messageJson.text;
            displayMessage = name + ":" + " " + txt;
            p.innerHTML = displayMessage;
            messagesElement.appendChild(p)
        });

    };
    request.send(JSON.stringify({ channelName: channel }));
}

//*************************loadUsers()
function loadUsers() {
    document.getElementById("myUsers").disabled=true;
    document.getElementById("mySelect").disabled=true;
    const request = new XMLHttpRequest();
    request.open('POST', "/loadUsers");
    request.setRequestHeader("Content-Type", "application/json");
        request.onload = () => {
            let userNames = request.responseText;
            let listOfusers = JSON.parse(userNames);
            listOfusers.forEach((usr) => {
                userSelect = document.querySelector('#myUser');
                option = document.createElement("option");
                option.text = usr;
                option.value = usr;
                userSelect.appendChild(option);
            });
        };
        request.send(JSON.stringify({ username: username }));
}


//************************************
let socketReady = false;

//********************Setting Socket IO **********************
document.addEventListener('DOMContentLoaded', () => {
    let socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    socket.on('connect', () => {
        socketReady = true;
        let messagesElement = document.querySelector('#messages');
        document.querySelector('#messages').value = "";

        socket.on('announce message', messagesString => {
            let messages = JSON.parse(messagesString);
            let messageJson = JSON.parse(messages);
            let p = document.createElement("p");
            name = messageJson.user;
            txt = messageJson.text;
            tme = messageJson.time;
            displayMessage = name + ":" + " " + txt + " " + tme;
            p.innerHTML = displayMessage;
            messagesElement.appendChild(p);
        });

        socket.on('announce directMessage', messagesString => {
            let messages = JSON.parse(messagesString);
            let messageJson = JSON.parse(messages);
            let p = document.createElement("p");
            name = messageJson.user;
            txt = messageJson.text;
            tme = messageJson.time;
            displayMessage = name + ":" + " " + txt + " " + tme;
            p.innerHTML = displayMessage;
            messagesElement.appendChild(p);
        });

    });

    //Condition to display username in local storage even after refreshing
    let lastUser = localStorage.getItem('username');
    if (lastUser) {
        document.querySelector('#myUsername').innerHTML = 'Your display name is currently ' + lastUser;
        document.querySelector('#submit1').disabled = true;
        username = lastUser;
    }

    // Retrieving channel list from server
    let channelRequest = new XMLHttpRequest();
    channelRequest.open('GET', "/channel");
    channelRequest.onload = () => {
        const response = channelRequest.responseText;
        let channels = JSON.parse(response);
        let channelSelect = document.querySelector('#mySelect')
        let lastSavedChannel = localStorage.getItem("channel");
        channels.forEach((channelName) => {
            option = document.createElement("option");
            option.text = channelName;
            option.value = channelName;
            channelSelect.appendChild(option);
            if (lastSavedChannel && lastSavedChannel == channelName) {
                channelSelect.value = channelName;
                channel = channelName;

            }
        });
    //Condition to store channel in localStorage and display all contents of channel even after refreshing the page:
    if (lastSavedChannel && channelSelect.value == lastSavedChannel) {
        const request = new XMLHttpRequest();
        request.open('POST', "/load");
        request.setRequestHeader("Content-Type", "application/json");
        request.onload = () => {
            let messagesElement = document.querySelector('#messages');
            const response = request.responseText;
            const messages = JSON.parse(response);

            messages.forEach((message) => {
                let messageJson = JSON.parse(message);
                let p = document.createElement("p");
                name = messageJson.user;
                txt = messageJson.text;
                displayMessage = name + ":" + " " + txt;
                p.innerHTML = displayMessage;
                messagesElement.appendChild(p)
            });

        };
        request.send(JSON.stringify({ channelName: lastSavedChannel }));
    }
    };
    channelRequest.send();



    // By default, submit buttons are disabled
    document.querySelector('#submit1').disabled = true;
    document.querySelector('#submit2').disabled = true;

    //This module is for Setting User's Display name: Enable button only if there is text in the input field and clear after submitting the text
    document.querySelector('#user').onkeyup = () => {
        if (document.querySelector('#user').value.length > 0) {

            document.querySelector('#submit1').disabled = false;
            document.querySelector('#submit1').onclick = () => {
                username = document.querySelector('#user').value;
                //Store username in localstorage
                localStorage.setItem('username', username);
                document.querySelector('#myUsername').innerHTML = 'Your display name is currently ' + username;
                document.querySelector('#user').value = '';
                document.querySelector('#submit1').disabled = true;
                // Stop form from submitting
                return false;
            }
        } else {
            document.querySelector('#submit1').disabled = true;
        }
    };

    //********************Setting Channel Name **********************

    //This module is for Creating New Channel name: Enable button only if there is text in the input field and clear after submitting the text
    document.querySelector('#channel').onkeyup = () => {
        if (document.querySelector('#channel').value.length > 0) {

            document.querySelector('#submit2').disabled = false;
            document.querySelector('#submit2').onclick = () => {
                channel = document.querySelector('#channel').value;
                //Store channel in localstorage
                if (!localStorage.getItem('channel')) {
                    localStorage.setItem('channel', channel);
                }

                //Checking channelList from the server
                const request = new XMLHttpRequest();
                request.open('GET', "/channel");
                request.onload = () => {
                    const response = request.responseText;
                    let listOfchannels = JSON.parse(response);
                    if (listOfchannels.includes(channel)) {
                        document.querySelector('#errorMsg').innerHTML = "This Channel Name Already Exists !"
                        document.querySelector('#channel').value = ""

                    }
                    else {
                        document.querySelector('#errorMsg').innerHTML = ""
                        document.querySelector('#myChannel').innerHTML = 'Current channel: ' + channel;
                        const requestTostore = new XMLHttpRequest();
                        requestTostore.open('POST', "/channel");
                        requestTostore.setRequestHeader("Content-Type", "application/json");
                        requestTostore.onload = () => {
                            channelSelect = document.querySelector('#mySelect');
                            option = document.createElement("option");
                            option.text = channel;
                            option.value = channel;
                            channelSelect.appendChild(option);
                        };
                        requestTostore.send(JSON.stringify({ channelName: channel }));

                    }
                }
                request.send();


                // Stop form from submitting
                return false;

            };
        };
    };


    //********************Getting Messages **********************
    document.querySelector('#submit3').onclick = () => {

        text = document.querySelector('#message').value;
        var date = new Date();
        var hrs = date.getHours();
        var min = date.getMinutes();
        let time=hrs+":"+min

        let message = {
            username,
            time,
            text
        }

        sendToUser = document.getElementById("myUser").value;
        noChannel = document.querySelector('#channel').value.length;
        noChannelist = document.getElementById("mySelect").disabled;


        if ((noChannel === 0) && (noChannelist) && (socketReady)) {
            socket.emit('directMessage', { 'userName': sendToUser, 'message': message });
        }
        else{
            socket.emit('submit message', { 'channelName': channel, 'message': message });
        }
        document.querySelector('#message').value="";

    }
});


