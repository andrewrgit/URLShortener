//Function called by the shorten button to request url from server
function generateUrl(){
    let urlField = document.getElementById("urlField");
    let urlText = document.getElementById("urlLoc");
    let copyBtn = document.getElementById("copyBtn");


    let params = {
        url: urlField.value
    }

    console.log("1");
    fetch("/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(params)
    }).then(response => {
        if(!response.ok){
            throw new Error("Unable to parse URL. Ensure it is in the correct format (http://websitename.com)");
        }
        return response.json();
    }).then( data => {
        urlText.innerHTML = data.url;
        urlText.style.color = "black";
        copyBtn.style.display = "block";
        console.log("displaying short url");
    }).catch(err => {
        urlText.innerHTML = err;
        urlText.style.color = "red";
        copyBtn.style.display = "none";
    })
    console.log("2");
}

//Button that copies generated url to clipboard
function copyToClipboard(){
    let urlText = document.getElementById("urlLoc");
    let copyBtn = document.getElementById("copyBtn");

    let textAreaElement = document.createElement("textarea");
    document.body.append(textAreaElement);
    textAreaElement.value = urlText.innerHTML;
    textAreaElement.select();
    document.execCommand("copy");
    document.body.removeChild(textAreaElement);
}

//Prevents issue that caused transitions to fire on page refresh
window.addEventListener("load", (event) => {
    let elements = document.getElementsByClassName("preload");
    for(let i = 0; i < elements.length; i++){
        elements[i].classList.remove("preload");
    }
})

//Prevents user from pressing enter to submit form, which caused unwanted page refresh
document.getElementById("urlForm").onkeypress = function(e) {
    let key = e.key; 
    if (key == "Enter") {
      e.preventDefault();
    }
  }