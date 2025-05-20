async function getData() {
  try {
    const usersRes = await fetch('http://localhost:3000/users');
    const users = await usersRes.json();

    renderCampaignerInfo(users);
  } catch (error) {
    showToast('Error loading data');
    console.error(error);
  }
}
function editCampaign(id) {
  fetch(`http://localhost:3000/campaigns/${id}`)
    .then((res) => res.json())
    .then((campaign) => {
      document.getElementsByName('title')[0].value = campaign.title;
      document.getElementsByName('description')[0].value = campaign.description;
      document.getElementsByName('goal')[0].value = campaign.goal;
      document.getElementsByName('deadline')[0].value = campaign.deadline;

      document.getElementById('campaignForm').dataset.editingId = campaign.id;
    });
}

function deleteCampaign(id) {
  if (confirm('Are you sure you want to delete this campaign?')) {
    fetch(`http://localhost:3000/campaigns/${id}`, {
      method: 'DELETE',
    }).then(() => {
      loadMyCampaigns();
      alert('Campaign deleted successfully!');
    });
  }
}

function showSection(section) {
  document.getElementById('addCampaignSection').style.display = 'none';
  document.getElementById('myCampaignsSection').style.display = 'none';

  if (section === 'add') {
    document.getElementById('addCampaignSection').style.display = 'block';
  } else if (section === 'my') {
    document.getElementById('myCampaignsSection').style.display = 'block';
    loadMyCampaigns();
  }
}

function loadMyCampaigns() {
  const userId = 2;
  fetch(`http://localhost:3000/campaigns?creatorId=${userId}`)
    .then((res) => res.json())
    .then((data) => {
      const approvedCampaigns = data.filter((campaign) => campaign.isApproved);

      const container = document.getElementById('myCampaignsContainer');
      container.innerHTML = '';

      if (approvedCampaigns.length === 0) {
        container.innerHTML = '<p>No approved campaigns found.</p>';
        return;
      }

      const grid = document.createElement('div');
      grid.style.display = 'grid';
      grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
      grid.style.gap = '1.5rem';

      approvedCampaigns.forEach((campaign) => {
        const card = document.createElement('div');
        card.classList.add('campaign-card');
        card.style.background = '#1f2a40';
        card.style.padding = '1rem';
        card.style.borderRadius = '10px';
        card.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.2)';
        card.style.color = '#fff';

        card.innerHTML = `
          <div class="view-mode">
            <img src="${campaign.image}" alt="Campaign Image" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem;" />
            <h3 class="title">${campaign.title}</h3>
            <p class="description">${campaign.description}</p>
            <p><strong>Goal:</strong> $<span class="goal">${campaign.goal}</span></p>
            <p><strong>Deadline:</strong> <span class="deadline">${campaign.deadline}</span></p>
            <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
              <button onclick="startInlineEdit('${campaign.id}', this)" style="flex:1; padding: 0.5rem; background-color: #ffa500; border: none; border-radius: 4px; color: white;">Edit</button>
              <button onclick="deleteCampaign('${campaign.id}')" style="flex:1; padding: 0.5rem; background-color: #dc3545; border: none; border-radius: 4px; color: white;">Delete</button>
            </div>
          </div>

          <div class="edit-mode" style=" height: 100%; display:none; background-color: #1a2131; padding: 1rem; border: 1px solid #2869ff; border-radius: 8px; color: #6291fd;">
            <input type="text" name="title" value="${campaign.title}" style="width: 100%; margin-bottom: 0.5rem; background-color: #1a2131; border: 1px solid #2869ff; color: #6291fd; border-radius: 5px; padding: 0.5rem;" />
            <textarea name="description" style="width: 100%; margin-bottom: 0.5rem; background-color: #1a2131; border: 1px solid #2869ff; color: #6291fd; border-radius: 5px; padding: 0.5rem;">${campaign.description}</textarea>
            <input type="number" name="goal" value="${campaign.goal}" style="width: 100%; margin-bottom: 0.5rem; background-color: #1a2131; border: 1px solid #2869ff; color: #6291fd; border-radius: 5px; padding: 0.5rem;" />
            <input type="date" name="deadline" value="${campaign.deadline}" style="width: 100%; margin-bottom: 0.5rem; background-color: #1a2131; border: 1px solid #2869ff; color: #6291fd; border-radius: 5px; padding: 0.5rem;" />
            <div style="display: flex; gap: 0.5rem;">
              <button onclick="saveInlineEdit('${campaign.id}', this)" style="flex:1; padding: 0.5rem; background-color: #6291fd; border: none; border-radius: 4px; color: white;">Save</button>
              <button onclick="cancelInlineEdit(this)" style="flex:1; padding: 0.5rem; background-color: #6c757d; border: none; border-radius: 4px; color: white;">Cancel</button>
            </div>
          </div>
        `;
        // 1. تحميل التبرعات الخاصة بالحملة
        fetch(`http://localhost:3000/pledges?campaignId=${campaign.id}`)
          .then((res) => res.json())
          .then((pledges) => {
            const totalDonated = pledges.reduce(
              (sum, p) => sum + Number(p.amount),
              0
            );
            const percent = Math.min(
              (totalDonated / campaign.goal) * 100,
              100
            ).toFixed(1); // cap at 100%

            // 2. إنشاء progress bar
            const progressWrapper = document.createElement('div');
            progressWrapper.style.marginTop = '1rem';

            progressWrapper.innerHTML = `
      <p><strong>Raised:</strong> $${totalDonated} (${percent}%)</p>
      <div style="width: 100%; background-color: #3b4861; border-radius: 10px; overflow: hidden; height: 10px; margin-bottom: 1rem;">
        <div style="width: ${percent}%; background-color: #4caf50; height: 100%;"></div>
      </div>
    `;

            // 3. إضافته داخل الـ card (في بداية الـ view-mode)
            // 3. إضافته داخل الـ card (في بداية الـ view-mode)
            const viewMode = card.querySelector('.view-mode');
            viewMode.insertBefore(
              progressWrapper,
              viewMode.querySelector('div')
            );

            // 4. لو اكتملت الحملة
            if (percent >= 100) {
              const completedMsg = document.createElement('p');
              completedMsg.textContent = ' Campaign fully funded!';
              completedMsg.style.color = '#4caf50';
              completedMsg.style.marginTop = '0.5rem';
              viewMode.insertBefore(completedMsg, progressWrapper.nextSibling);

              // (اختياري) إلغاء الأزرار
              const buttons = viewMode.querySelectorAll('button');
              buttons.forEach((btn) => (btn.disabled = true));
            }
          });

        grid.appendChild(card);
      });

      container.appendChild(grid);
    });
}

function startInlineEdit(id, btn) {
  const card = btn.closest('.campaign-card');
  card.querySelector('.view-mode').style.display = 'none';
  card.querySelector('.edit-mode').style.display = 'block';
}

function cancelInlineEdit(btn) {
  const card = btn.closest('.campaign-card');
  card.querySelector('.edit-mode').style.display = 'none';
  card.querySelector('.view-mode').style.display = 'block';
}

function saveInlineEdit(id, btn) {
  const card = btn.closest('.campaign-card');
  console.log('card:', card);
  if (!card) {
    console.error('Card container not found!');
    alert('Error: Could not find campaign card container.');
    return;
  }

  const title = card.querySelector('input[name="title"]').value.trim();
  const description = card
    .querySelector('textarea[name="description"]')
    .value.trim();
  const goal = Number(card.querySelector('input[name="goal"]').value);
  const deadline = card.querySelector('input[name="deadline"]').value;

  fetch(`http://localhost:3000/campaigns/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, goal, deadline }),
  })
    .then((res) => {
      if (!res.ok) throw new Error('Failed to update campaign');
      return res.json();
    })
    .then((updatedCampaign) => {
      const titleElem = card.querySelector('.title');
      const descElem = card.querySelector('.description');
      const goalElem = card.querySelector('.goal');
      const deadlineElem = card.querySelector('.deadline');

      if (titleElem) titleElem.textContent = updatedCampaign.title;
      else console.warn('Title element not found');

      if (descElem) descElem.textContent = updatedCampaign.description;
      else console.warn('Description element not found');

      if (goalElem) goalElem.textContent = updatedCampaign.goal;
      else console.warn('Goal element not found');

      if (deadlineElem) deadlineElem.textContent = updatedCampaign.deadline;
      else console.warn('Deadline element not found');

      card.querySelector('.edit-mode').style.display = 'none';
      card.querySelector('.view-mode').style.display = 'block';

      console.log('Campaign updated successfully!');
      alert('Campaign updated successfully!');
    })
    .catch((err) => {
      console.error(err.message);
      alert(err.message);
    });
}

function compressImage(file, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };

    reader.readAsDataURL(file);
  });
}

const btnSubmit = document.querySelector('button[type="submit"]');

let rewardIdCounter = 1;

function addReward() {
  const container = document.getElementById('rewardsContainer');
  const titleInput = document.createElement('input');
  titleInput.placeholder = 'Reward Title';
  titleInput.className = 'reward-title';

  const amountInput = document.createElement('input');
  amountInput.placeholder = 'Amount';
  amountInput.type = 'number';
  amountInput.className = 'reward-amount';

  container.appendChild(titleInput);
  container.appendChild(amountInput);
}
function renderCampaign(campaign) {
  const campaignsContainer = document.getElementById('campaignsContainer');

  const campaignDiv = document.createElement('div');
  campaignDiv.className = 'campaign-card';

  campaignDiv.innerHTML = `
    <h3>${campaign.title}</h3>
    <p>${campaign.description}</p>
    <p>Goal: $${campaign.goal}</p>
    <p>Deadline: ${campaign.deadline}</p>
    <p>Category: ${campaign.category}</p>
    <img src="${campaign.image}" alt="${campaign.title}" style="max-width: 100%; height: auto;">
  `;

  campaignsContainer.appendChild(campaignDiv);
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.right = '20px';
  toast.style.padding = '10px 20px';
  toast.style.backgroundColor = type === 'success' ? 'green' : 'red';
  toast.style.color = 'white';
  toast.style.borderRadius = '5px';
  toast.style.zIndex = '1000';
  toast.style.transition = 'opacity 0.5s ease';
  toast.style.opacity = '1';

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
    }, 500);
  }, 3000);
}

document
  .getElementById('campaignForm')
  .addEventListener('submit', async function (e) {
    console.log('Form submitted, preventing reload');
    e.preventDefault();

    const title = document.getElementsByName('title')[0].value.trim();
    const description = document
      .getElementsByName('description')[0]
      .value.trim();
    const goal = Number(document.getElementsByName('goal')[0].value);
    const deadline = document.getElementsByName('deadline')[0].value;
    const imageFile = document.getElementsByName('image')[0].files[0];

    let imageBase64 = null;
    if (imageFile) {
      try {
        imageBase64 = await compressImage(imageFile);
      } catch (err) {
        console.log('Error compressing image: ' + err.message);
        alert('Error compressing image: ' + err.message);
        return;
      }
    }
    const form = this;

    const editingId = form.dataset.editingId;

    const data = {
      title,
      description,
      goal,
      deadline,
      creatorId: '2',
      isApproved: false,
    };

    if (imageBase64) {
      data.image = imageBase64;
    }

    if (editingId) {
      fetch(`http://localhost:3000/campaigns/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to update campaign');
          return res.json();
        })
        .then(() => {
          showToast('Campaign updated successfully!');
          console.log('Campaign updated successfully!');
          alert('Campaign updated successfully!');
          form.reset();
          delete form.dataset.editingId;
          loadMyCampaigns();
          document.getElementById('campaignForm').style.display = 'none';
        })
        .catch((err) => {
          console.error(err.message);
          alert(err.message);
        });
    } else {
      fetch('http://localhost:3000/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to add campaign');
          return res.json();
        })
        .then(() => {
          showToast('Campaign added successfully!');

          alert('Campaign added successfully!');
          form.reset();
          loadMyCampaigns();
          document.getElementById('campaignForm').style.display = 'none';
        })
        .catch((err) => {
          console.error(err.message);
          alert(err.message);
        });
    }
  });

function renderCampaignerInfo(users) {
  const campaigner = users.find((user) => user.role === 'approved_campaigner');
  const container = document.getElementById('campaignerInfo');
  container.className = 'campaigner-info';

  if (campaigner) {
    container.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <img src="${'https://randomuser.me/api/portraits/men/32.jpg'}" alt="Campaigner Avatar" class="campaigner-avatar" />
        <div class="campaigner-details">
          <strong>${campaigner.name}</strong>
          <span>Campaign Manager</span>
        </div>
      </div>
    `;
  } else {
    container.innerHTML = '<p>No campaigner found.</p>';
  }
}
getData();
