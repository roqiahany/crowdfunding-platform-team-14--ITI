window.addEventListener('load',()=>{

    document.querySelector('#signupForm').addEventListener('submit',async(e)=>{
        e.preventDefault();

        //select all fields and set values to variables
        let firstName=document.querySelector('#form3Example1').value.trim();
        let lastName=document.querySelector('#form3Example2').value.trim();
        let email=document.querySelector('#form3Example3').value.trim();
        let password=document.querySelector('#form3Example4').value.trim();
        let role=document.querySelector('input[name="role"]:checked')?.value;

        //check that user fill all fields
        if(!firstName || !lastName || !email || !password || !role){
            alert('please fill all fields');
            return;
        }

        const newUser={
            name:`${firstName} ${lastName}`,
            email:email,
            password:password,
            role:role,
            isActive:true                     //user active في البدايه
        }


        //post data to json
        try {
            let response=await fetch('http://localhost:3000/users',{
                method:"POST",
                headers:{
                    "Content-Type": "application/json"
                },
                body:JSON.stringify(newUser)
            })

            if(response.ok){
                console.log("Registration SuccessFully!");
                window.location.href="./login.html"
            }else{
                alert("Registration failed. Please try again.")
            }
        
        }catch (error) {
            alert("Something went wrong. Check your server connection.");
        }
        })
   

    

});  //end of load