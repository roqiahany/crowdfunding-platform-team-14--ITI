window.addEventListener('load',()=>{
    let campaignCard=document.querySelector('.compaign-info');
    let sortButton=document.querySelector('#sortByDeadline');
    let buttonFilter=document.querySelectorAll('.filter-button')
    let campaignsData=[];


    const getAllCampaigns=async function(){
        try {
            let response=await fetch('http://localhost:3000/campaigns');
            let result=await response.json();

            campaignsData=result;

            displayCampaignsData(campaignsData)

        } catch (error) {
            console.error("Error fetching campaigns:", error);
        }
    }

    const displayCampaignsData=function(result){
        campaignCard.innerHTML='';
        result.forEach(compaign => {
            let card=
            `
            <div class="col-md-4">
                <div class="bg-success p-2 campaign">
                    <img src="${compaign.image}" alt="" class="img-fluid"/>
                    <p class="text-center fs-4 fw-semibold pt-2">${compaign.title}</p>
                    <p> ${compaign.description}</p>
                    <p>goal: ${compaign.goal}$</p>
                    <p>Deadlind: ${compaign.deadline}</p>
                    <a href="../DonationForm/donation.html?id=${compaign.id}">
                        <button class="btn btn-primary px-3">Donate Now</button>
                    </a>
                </div>
            </div>
            `;
            campaignCard.innerHTML+=card;
        })

    };

    sortButton.addEventListener('click', () => {
        const sorted = [...campaignsData].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        displayCampaignsData(sorted);
    });

    buttonFilter.forEach(button=>{
        button.addEventListener('click',async()=>{
            let category=button.innerHTML.trim();

            if(category=="All"){
                getAllCampaigns();
                return;
            }

            try {
               let response=await fetch(`http://localhost:3000/campaigns?category=${category}`);
               let result=await response.json()
               campaignsData=result;
               displayCampaignsData(campaignsData)
                
            } catch (error) {
                console.error("Error fetching filtered campaigns:", error);
            }
        })
    })

    getAllCampaigns()

    //move to donation history page
    document.querySelector("#showDonationsBtn").addEventListener("click", () => {
       window.location.href = "../DonationHistory/donationHistory.html";
    });
        

}); //end of load