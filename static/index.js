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
    });

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


    //********************Setting Socket IO **********************
    // By default, submit button is disabled
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
        //chSelected = document.querySelector('#mySelect').value.onclick()
        //if  (username.length > 0){
        //channel = document.querySelector('#mySelect').option.onclick();
        //message = username + "," + "12.30" + "," + document.querySelector('#message').value;
        text = document.querySelector('#message').value;
        // Get UTC and add that to server
        var time = new Date(Date.UTC(2018, 06, 24))
        //time = time.toUTCString();
        //var dt = new Date();
        //console.log(dt); // Gives Tue Mar 22 2016 09:30:00 GMT+0530 (IST)

        //dt.setTime(dt.getTime()+dt.getTimezoneOffset()*60*1000);
        //console.log(dt); // Gives Tue Mar 22 2016 04:00:00 GMT+0530 (IST)

        //var offset = -300; //Timezone offset for EST in minutes.
        //var time = new Date(dt.getTime() + offset*60*1000);
        //console.log(time); //Gives Mon Mar 21 2016 23:00:00 GMT+0530 (IST)

        //var estTime = new Date(Date.UTC(year, month, day, hour, minute, second)); // get local time to be calculated into EST
        //var time = estTime.setHours(estTime.getHours() + estTime.getTimezoneOffset()/60 - 5); // getTimezoneOffset returns in minutes hence /6

        let message = {
            username,
            time,
            text
        }
        //document.querySelector('#body3').innerHTML = message.text;
        //document.querySelector('#message').value = '';
        // When connected, configure buttons
        if (socketReady) {
            socket.emit('submit message', { 'channelName': channel, 'message': message });
        }
    }
});