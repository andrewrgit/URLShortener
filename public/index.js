//Function called by the shorten button to request url from server
function generateUrl(){
    var urlField = document.getElementById("urlField");
    var urlText = document.getElementById("urlLoc");
    var copyBtn = document.getElementById("copyBtn");

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/", false);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    var params = {
        url: urlField.value
    }

    xhr.send(JSON.stringify(params));
    if(xhr.status == 400){
        urlText.innerHTML = "ERROR: Unable to parse URL. Ensure it is in the correct format (http://websitename.com)"
        urlText.style.color = "red";
        copyBtn.style.visibility = "hidden";
    }
    else{
        urlText.innerHTML = JSON.parse(xhr.response).url;
        urlText.style.color = "black";
        copyBtn.style.visibility = "";
    }
    
    
}

//Button that copies generated url to clipboard
function copyToClipboard(){
    var urlText = document.getElementById("urlLoc");
    var copyBtn = document.getElementById("copyBtn");

    var textAreaElement = document.createElement("textarea");
    document.body.append(textAreaElement);
    textAreaElement.value = urlText.innerHTML;
    textAreaElement.select();
    document.execCommand("copy");
    document.body.removeChild(textAreaElement);
}

//Prevents issue that caused transitions to fire on page refresh
window.addEventListener("load", (event) => {
    var elements = document.getElementsByClassName("preload");
    for(var i =0; i < elements.length; i++){
        elements[i].classList.remove("preload");
    }
})

//Prevents user from pressing enter to submit form, which caused unwanted page refresh
document.getElementById("urlForm").onkeypress = function(e) {
    var key = e.key; 
    if (key == "Enter") {
      e.preventDefault();
    }
  }