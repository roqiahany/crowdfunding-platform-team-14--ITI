window.addEventListener('load', async () => {
    let container = document.querySelector('#donationsContainer');
    let user = JSON.parse(localStorage.getItem('loggedInUser'));

    try {
        //get all pledges
        let response = await fetch(`http://localhost:3000/pledges?userId=${user.id}`);
        let pledges = await response.json();

        // get all campaigns
        let campaignsResponse = await fetch('http://localhost:3000/campaigns');
        let campaigns = await campaignsResponse.json();

        // check if exist pledges
        if (pledges.length === 0) {
            container.innerHTML = `<p class="text-muted text-center fs-5 text-light">You haven't made any donations yet.</p>`;
            return;
        }

        //
        let campaignMap = new Map();
        campaigns.forEach(c => campaignMap.set(String(c.id), c.title));

        pledges.forEach(pledge => {
            let campaignTitle = campaignMap.get(String(pledge.campaignId)) || 'Unknown Campaign';

            let card = document.createElement('div');
            card.className = 'col-md-6 col-lg-4 mb-4';

            card.innerHTML = `
                <div class="card donation-card shadow rounded-4 h-100 border-0">
                    <div class="card-body d-flex flex-column justify-content-between">
                        <h5 class="card-title mb-4 fs-5">
                            <i class="fa-brands fa-slack me-2 text-primary"></i>${campaignTitle}
                        </h5>
                        <p class="text-secondary fs-5">
                            <i class="fa-solid fa-gifts pt-3 me-2 text-danger"></i>Reward ID: 
                            <span class="fw-bold text-black fs-5">${pledge.rewardId}</span>
                        </p>
                        <p class="fs-5 fw-bold mt-3">
                            <i class="fa-solid fa-sack-dollar text-primary fs-4 me-2"></i>${pledge.amount}$
                        </p>
                    </div>
                </div>
            `;

            container.appendChild(card);
        });
    } catch (error) {
        container.innerHTML = `<p class="text-danger">Failed to load donation log.</p>`;
        console.error(error);
    }
});
