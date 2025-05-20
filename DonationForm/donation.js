window.addEventListener('load', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const campaignId = parseInt(urlParams.get('id'));

  const rewardSelect = document.getElementById('rewardId');
  const donationForm = document.getElementById('donationForm');

  try {
    //get all campaigns
    const res = await fetch(`http://localhost:3000/campaigns/${campaignId}`);
    const campaign = await res.json();

    rewardSelect.innerHTML = '<option disabled selected>choose reward</option>';

    campaign.rewards.forEach(reward => {
      const option = document.createElement('option');
      option.value = reward.id;
      option.textContent = `${reward.title}`;
      rewardSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading rewards:', error);
  }

  
  donationForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const amount = parseFloat(document.getElementById('amount').value);
    const rewardId = parseInt(rewardSelect.value);
    const user = JSON.parse(localStorage.getItem('loggedInUser'));

    if (!user || !user.id) {
      alert("You must log in first.");
      return;
    }

    const pledge = {
      campaignId: campaignId,
      userId: user.id,
      amount: amount,
      rewardId: rewardId
    };

    try {
      const res = await fetch('http://localhost:3000/pledges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pledge)
      });

      if (!res.ok) throw new Error('Failed to send donation');

      alert("Donation successful, thank you!");
      donationForm.reset();
    } catch (err) {
      console.error('Error sending donation:', err);
      alert("An error occurred while donating. Send donation.");
    }
  });
});
