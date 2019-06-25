function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    var email = profile.getEmail()
    var id_token = googleUser.getAuthResponse().id_token
    gapi.auth2.getAuthInstance().disconnect()

    $.post(
        "https://localhost:3000/auth/loginGoogle", 
         {"token": id_token, "email": email}, 'json').error(function(){
            alert("an error occurred");
         }).success(function(data){
            window.location.href = data
         });
}

function addGoogle(googleUser){
    var profile = googleUser.getBasicProfile();
    var id_token = googleUser.getAuthResponse().id_token
    var email = profile.getEmail()
    gapi.auth2.getAuthInstance().disconnect()
    
    $.post(
        "https://localhost:3000/auth/addGoogle", 
        {"token" : id_token, "email" : email}, 'json').error(function(){
            alert("an error occurred");
        }).success(function(){
            window.location.href = '/user';
        });
}

function onFailure(){
    console.log("Failure during google login")
}

function signOut(){
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
    })
}

