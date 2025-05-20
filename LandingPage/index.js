window.addEventListener('load', () => {
  const compaignsContainer = document.querySelector('.compaigns-cards');
  const prevBtn = document.querySelector('.pagination button:first-child');
  const nextBtn = document.querySelector('.pagination button:last-child');
  const searchInput = document.querySelector('#searchInput');
  const searchBtn = document.querySelector('#searchBtn');

  let allCampaigns = [];
  let filteredCampaigns = [];
  let currentPage = 1;
  const campaignsPerPage = 3;

  const getAllCampaignsCards = async () => {
    try {
      const response = await fetch("http://localhost:3000/campaigns");
      const result = await response.json();
      allCampaigns = result;
      filteredCampaigns = result;
      displayCampaigns();
      updateButtons();
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    }
  };

  const displayCampaigns = () => {
    compaignsContainer.innerHTML = '';

    const startIndex = (currentPage - 1) * campaignsPerPage;
    const endIndex = startIndex + campaignsPerPage;
    const currentCampaigns = filteredCampaigns.slice(startIndex, endIndex);

    if (currentCampaigns.length === 0) {
      compaignsContainer.innerHTML = '<p class="text-center">No campaigns found.</p>';
      return;
    }

    currentCampaigns.forEach(compaign => {
      const cardCompaign = `
            <div class="col-md-4">
                <div class="bg-success p-2 campaign">
                    <img src="${compaign.image}" alt="" class="img-fluid"/>
                    <h5 class="text-center fs-4 fw-semibold py-2 px-3">${compaign.title}</h5>
                    <p> ${compaign.description}</p>
                    <p>goal:<span class="fs-5 fw-bold"> ${compaign.goal}$</span></p>
                    <p>Deadlind:<span class="fw-semibold"> ${compaign.deadline}</span></p>
                    <a href="../auth/login.html">
                        <button class="btn btn-primary px-3">Donate Now</button>
                    </a>
                </div>
            </div>
            `;
      compaignsContainer.innerHTML += cardCompaign;
    });
  };

  const updateButtons = () => {
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage * campaignsPerPage >= filteredCampaigns.length;
  };

  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      displayCampaigns();
      updateButtons();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentPage * campaignsPerPage < filteredCampaigns.length) {
      currentPage++;
      displayCampaigns();
      updateButtons();
    }
  });

  const applySearch = () => {
    const query = searchInput.value.toLowerCase().trim();
    currentPage = 1;

    if (query === "") {
      filteredCampaigns = allCampaigns;
    } else {
      filteredCampaigns = allCampaigns.filter(c =>
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query)
      );
    }

    displayCampaigns();
    updateButtons();
  };

  searchBtn.addEventListener('click', applySearch);

  getAllCampaignsCards();
});
