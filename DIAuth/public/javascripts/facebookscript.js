function loginFacebook() {
    FB.getLoginStatus(function(response) {
        if(response.status === 'connected'){
            console.log(response)
            $.post(
                "https://localhost:3000/auth/loginFacebook", 
                {"id": response.authResponse.userID, "token": response.authResponse.accessToken}, 'json').error(function(){
                    alert("an error occurred");
                }).success(function(response){
                    window.location.href = response;
                });
            //testAPI();
            /*FB.api('/me', {fields: 'name'}, function(response){
                $.post(
                    "http://localhost:3000/auth/loginFacebook", 
                    {"id": response.id}, 'json').error(function(){
                        alert("an error occurred");
                    }).success(function(){
                        console.log('success')
                        window.location.href = '/user';
                    });
            })*/
        }
    });
}

function addFacebook() {
    FB.getLoginStatus(function(response) {
        console.log(response);
        if(response.status === 'connected'){
            $.post(
                "https://localhost:3000/auth/addFacebook", 
                {"id": response.authResponse.userID, "token": response.authResponse.accessToken}, 'json').error(function(){
                    alert("an error occurred");
                }).success(function(response){
                    window.location.href = '/user';
                    //window.location.href = response;
                });
        }
    });
}