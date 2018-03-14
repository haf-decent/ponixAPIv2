var bots,
    sensors,
    seqClick = false;

var seqs = {
    drain: "drain",
    dose: "dose",
    shutdown: "shutdown"
}

var table = document.getElementsByTagName("TABLE")[0],
    uri = document.URL.split("views/")[0];

window.onload = function() {
    for (var i = 0; i < 20; i++) {
        var ch = document.createElement("TR");
        ch.innerHTML = "<td></td>";
        ch.innerHTML += "<td class='pin'>" + (2*i+1) + "</td><td class='pin'>" + (2*i+2) + "</td>";
        ch.innerHTML += "<td></td>";
        table.appendChild(ch);
    }
    var req = new XMLHttpRequest();
    req.open("POST", uri + "sequences/initialize");
    req.onloadend = function(res) {
        res = JSON.parse(res.target.response);
        bots = res.data.bots;
        sensors = res.data.sensors;
        assign();
    }
    req.send();
//                sensorReq();
//                setInterval(sensorReq, 5000);
}

function sensorReq() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "http://192.168.1.14:81/sensor/humiTemp?ht1");
    xhr.onload = function(res, err) {
        var ht = JSON.parse(res.target.response).data;
        if (ht == "timeout") {
            document.getElementById("temp").innerHTML = "--";
            document.getElementById("hum").innerHTML = "--";
        }
        else {
            document.getElementById("temp").innerHTML = ht.t.toFixed(1) + "F";
            document.getElementById("hum").innerHTML = ht.h.toFixed(1) + "%";
        }
    }
    xhr.send();

    var xhr1 = new XMLHttpRequest();
    xhr1.open("GET", "http://192.168.1.14:81/sensor/waterTemp");
    xhr1.onload = function(res, err) {
        var wt = err ? "--" : (JSON.parse(res.target.response).data * 2/3 + 40).toFixed(1);
        document.getElementById("wTemp").innerHTML = wt + "F";
    }
    xhr1.send();

    var xhr2 = new XMLHttpRequest();
    xhr2.open("GET", "http://192.168.1.14:81/sensor/waterLevel?mixLevel");
    xhr2.onload = function(res, err) {
        var lev = err ? "--" : JSON.parse(res.target.response).data.toFixed(1);
        document.getElementById("wLevel").innerHTML = lev + "in";
    }
    xhr2.send();
}

function assign() {
    for (var bot in bots) {
        var target = [];
        target[0] = Math.ceil(bots[bot]["pin"]/2) - 1;
        target[1] = (bots[bot]["pin"] % 2) ? 0: 3;
        table.children[target[0]].children[target[1]].innerHTML = bot;
        var butt = document.createElement("LABEL");
        butt.className = "switch";
        butt.innerHTML = "<input type='checkbox'><span class='slider round' onclick='toggle(this.parentElement.children[0])'></span>";
        var name = document.createElement("DIV");
        name.id = bot;
        name.innerHTML = "<h3>" + bot + "</h3>";
        name.appendChild(butt);
        document.getElementById("left-up-card").appendChild(name);
        if (bots[bot].state == 1) butt.children[1].click();
    }
    for (var sensor in sensors) {
        var p = document.createElement("P");
        p.id = sensor;
        p.innerHTML = "--";
        var name = document.createElement("DIV");
        name.innerHTML = "<h3>" + sensor + "</h3>";
        name.appendChild(p);
        document.getElementById("right-up-card").appendChild(name);
    }
    for (var seq in seqs) {
        var butt = document.createElement("BUTTON");
        butt.innerHTML = seq;
        butt.onclick = function() {
            var req = new XMLHttpRequest();
            req.open("POST", uri + "sequences/" + this.innerHTML);
            req.onloadend = function(res) {
                bots = JSON.parse(res.target.response).data.bots;
                seqClick = true;
                for (var bot in bots) {
                    var label = document.getElementById(bot).children[1];
                    var curr = label.children[0].checked;
                    var actual = (bots[bot].state == "1") ? true: false;
                    if (curr !== actual) label.children[1].click();
                }
                seqClick = false;
            }
            req.send();
        };
        document.getElementById("right-down-card").appendChild(butt);
    }
}

function toggle(input, seq) {
    if (seqClick) return;
    var state = (input.checked) ? 0: 1;
    var req = new XMLHttpRequest();
    req.open("PUT", uri + "bots/" + input.parentElement.parentElement.children[0].innerHTML + "/" + state);
    req.onloadend = function(res) {
        console.log(res.target.response);
    }
    req.send();
}