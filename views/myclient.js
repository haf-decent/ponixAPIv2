var bots = {},
    sensors,
    seqClick = false,
    init = true;

var seqs = {
    shutdown: "shutdown"
}

var table = document.getElementsByTagName("TABLE")[0],
    uri = document.URL.split("views/")[0],
    uri2 = '';

var start = function() {
    var req = new XMLHttpRequest();
    req.open("GET", uri + "bots/");
    req.onloadend = function(res) {
        res = JSON.parse(res.target.response);
        bots = res.data.bots;
        assign();
    }
    req.send();
}

window.onload = function() {
    for (var i = 1; i <= 10; i++) {
        bots["light_"+i] = {state: "0"};
    }
    for (var v = 1; v <= 30; v++) {
        bots["valve_"+v] = {state: "0"};
    }
    assign();
}

function assign() {
    for (var bot in bots) {
        var butt = document.createElement("LABEL");
        butt.className = "switch";
        butt.innerHTML = "<input type='checkbox'><span class='slider round' onclick='toggle(this.parentElement.children[0])'></span>";
        var name = document.createElement("DIV");
        name.id = bot;
        name.innerHTML = "<h3>" + bot + "</h3>";
        name.appendChild(butt);
        document.getElementById("container").appendChild(name);
        if (bots[bot].state == 1) butt.children[1].click();
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
            var req2 = new XMLHttpRequest();
            req2.open("POST", uri2 + "sequences/" + this.innerHTML);
            req2.onloadend = function(res2) {
                bots = JSON.parse(res2.target.response).data.bots;
                seqClick = true;
                for (var bot in bots) {
                    var label = document.getElementById(bot).children[1];
                    var curr = label.children[0].checked;
                    var actual = (bots[bot].state == "1") ? true: false;
                    if (curr !== actual) label.children[1].click();
                }
                seqClick = false;
            }
            req2.send();
        };
        document.getElementById("container").appendChild(butt);
    }
    init = false;
}

function toggle(input, seq) {
    if (seqClick || init) return;
    var state = (input.checked) ? 0: 1;
    var req = new XMLHttpRequest();
    req.open("PUT", uri + "bots/" + input.parentElement.parentElement.children[0].innerHTML + "/" + state);
    req.onloadend = function(res) {
        console.log(res.target.response);
    }
    req.send();
}