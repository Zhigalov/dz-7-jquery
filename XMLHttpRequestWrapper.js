function callback (text) {
    console.log(text);
}

function postFile (fileName, data, callback) {
    "use strict"

    $.post(fileName, callback);
}

function getFile(fileName, callback) {
    "use strict"

    $.get(fileName, callback);
}