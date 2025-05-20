document.getElementById('filterInactive').addEventListener('change', getData);

async function getData() {
  try {
    const usersRes = await fetch('http://localhost:3000/users');
    const users = await usersRes.json();

    const campaignsRes = await fetch('http://localhost:3000/campaigns');
    const campaigns = await campaignsRes.json();

    const pledgesRes = await fetch('http://localhost:3000/pledges');
    const pledges = await pledgesRes.json();

    renderAdminInfo(users);

    renderUsers(users);
    renderCampaigns(campaigns);
    renderPledges(pledges, users, campaigns);
    renderStats(users, campaigns, pledges);
  } catch (error) {
    showToast('Error loading data');
    console.error(error);
  }
}

async function updateUserRole(id, newRole) {
  await fetch(`http://localhost:3000/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: newRole }),
  });
  showToast('User role updated');
  getData();
}

async function blockUser(id) {
  await fetch(`http://localhost:3000/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isActive: false }),
  });
  showToast('User blocked');
  getData();
}

async function approveCampaign(id) {
  await fetch(`http://localhost:3000/campaigns/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isApproved: true }),
  });
  showToast('Campaign approved');
  getData();
}

async function deleteCampaign(id) {
  const confirmDelete = confirm(
    'Are you sure you want to delete this campaign?'
  );
  if (!confirmDelete) return;

  await fetch(`http://localhost:3000/campaigns/${id}`, {
    method: 'DELETE',
  });

  showToast('Campaign deleted successfully');
  getData();
}

function renderUsers(users) {
  const filterInactive = document.getElementById('filterInactive').checked;
  const table = document.getElementById('usersTable');
  const filteredUsers = filterInactive
    ? users.filter((u) => !u.isActive)
    : users;

  table.innerHTML = `
    <thead>
      <tr>
        <th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Active</th><th>Actions</th>
      </tr>
    </thead>
    <tbody>

   

      ${filteredUsers
        .map((user) => {
          const approveRejectButtons =
            user.role === 'campaigner'
              ? `
                <button class="approve-btn" onclick="updateUserRole('${user.id}', 'approved_campaigner')">Approve</button>
                <button class="reject-btn" onclick="updateUserRole('${user.id}', 'user')">Reject</button>
              `
              : '';
          return `
            <tr>
              <td>${user.id}</td>
              <td>${user.name}</td>
              <td>${user.email}</td>
              <td>${user.role}</td>
              <td>${user.isActive ? 'Yes' : 'No'}</td>
             <td> ${approveRejectButtons}
  ${
    user.role === 'admin'
      ? '<button disabled style="opacity:0.5; cursor:not-allowed;">Block</button>'
      : `<button class="block-btn" onclick="blockUser(${user.id})">Block</button>`
  }
</td>
            </tr>
          `;
        })
        .join('')}
    </tbody>
  `;
}

function renderCampaigns(campaigns) {
  const table = document.getElementById('campaignsTable');
  table.innerHTML = `
    <thead>
      <tr>
        <th>ID</th><th>Title</th><th>Status</th><th>Actions</th>
      </tr>
    </thead>
    <tbody>
      ${campaigns
        .map(
          (c) => `
          <tr>
            <td>${c.id}</td>
            <td>${c.title}</td>
            <td>${c.isApproved ? 'Approved' : 'Pending'}</td>
           <td>
  ${
    !c.isApproved
      ? `<button class="approve-btn" onclick="approveCampaign('${c.id}')">Approve</button>`
      : ''
  }
  <button class="delete-btn" onclick="deleteCampaign('${c.id}')">Delete</button>
</td>
</button>
            </td>
          </tr>
        `
        )
        .join('')}
    </tbody>
  `;
}

function renderPledges(pledges, users, campaigns) {
  console.log('pledges', pledges, 'users', users, 'campaigns', campaigns);
  console.log(users[0].name, campaigns[0].title);
  const table = document.getElementById('pledgesTable');
  table.innerHTML = `
    <thead>
      <tr>
        <th>ID</th><th>User</th><th>Title Campaign</th><th>Amount</th>
      </tr>
    </thead>
    <tbody>
      ${pledges
        .map((p) => {
          const user = users.find((u) => u.id === p.userId);

          const campaign = campaigns.find((c) => c.id === p.campaignId);
          console.log(campaigns.find((c) => c.creatorId === p.campaignId));
          return `
            <tr>
              <td>${p.id}</td>
              <td>${user ? user.name : 'Unknown'}</td>
              
              <td>${campaign ? campaign.title : 'Unknown'}</td>
              <td>$${p.amount}</td>
            </tr>
          `;
        })
        .join('')}
    </tbody>
  `;
}

function renderStats(users, campaigns, pledges) {
  const stats = document.getElementById('stats');
  const approvedCampaigns = campaigns.filter((c) => c.isApproved).length;
  const totalDonations = pledges.reduce((sum, p) => sum + p.amount, 0);

  stats.innerHTML = `
    <div class="card">
      <h3>Total Users</h3>
      <strong>${users.length}</strong>
    </div>
    <div class="card">
      <h3>Approved Campaigns</h3>
      <strong>${approvedCampaigns}</strong>
    </div>
    <div class="card">
      <h3>Total Donations</h3>
      <strong>$${totalDonations}</strong>
    </div>
  `;
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.style.display = 'block';

  if (toast.timeoutId) clearTimeout(toast.timeoutId);

  toast.timeoutId = setTimeout(() => {
    toast.style.display = 'none';
  }, 4000);
}

function renderAdminInfo(users) {
  const admin = users.find((user) => user.role === 'admin');
  const adminInfoContainer = document.getElementById('adminInfo');

  adminInfoContainer.className = 'admin-info';

  if (admin) {
    adminInfoContainer.innerHTML = `
      <img src="${admin.img}" alt="Admin Avatar" class="admin-avatar" />
      <h3>Welcome, ${admin.name}</h3>
     
    `;
  } else {
    adminInfoContainer.innerHTML = `<p>No active admin found.</p>`;
  }
}

getData();
