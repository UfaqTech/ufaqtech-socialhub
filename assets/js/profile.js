const supabaseUrl = window.UFAQTECH_SUPABASE_URL || 'https://YOUR_SUPABASE_URL.supabase.co';
const supabaseKey = window.UFAQTECH_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

const totalLinks = document.getElementById('totalLinks');
const totalViews = document.getElementById('totalViews');
const securityScore = document.getElementById('securityScore');
const profileLinks = document.getElementById('profileLinks');
const activityFeed = document.getElementById('activityFeed');
const editProfileDummyBtn = document.getElementById('editProfileDummyBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');

const sidebar = document.getElementById('sidebar');
const menuToggleBtn = document.getElementById('menuToggleBtn');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const sidebarName = document.getElementById('sidebarName');
const sidebarEmail = document.getElementById('sidebarEmail');
const sidebarAvatar = document.getElementById('sidebarAvatar');
const logoutBtn = document.getElementById('logoutBtn');

function applyTheme(theme = localStorage.getItem('socialhub-theme') || 'light') {
  document.documentElement.setAttribute('data-theme', theme);
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('socialhub-theme', theme);
  if (themeToggleBtn) {
    themeToggleBtn.innerHTML = theme === 'dark'
      ? '<i class="fa-solid fa-sun"></i>'
      : '<i class="fa-solid fa-moon"></i>';
  }
}

function showToast(message, isError = false) {
  let toast = document.getElementById('custom-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'custom-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.style.cssText = `
      position: fixed; bottom: 24px; left: 24px; z-index: 10000; max-width: 360px;
      background: var(--surface-card); color: var(--text-main); border-left: 5px solid #2563eb;
      padding: 14px 18px; border-radius: 12px; box-shadow: var(--shadow-lg); display: flex;
      align-items: center; gap: 10px; transition: all 0.3s ease; transform: translateY(120px); opacity: 0;
    `;
    document.body.appendChild(toast);
  }

  toast.style.borderLeftColor = isError ? '#ef4444' : '#2563eb';
  toast.innerHTML = isError
    ? `<span style="color: #ef4444">⚠️</span> ${message}`
    : `<span style="color: #2563eb">✨</span> ${message}`;
  toast.style.transform = 'translateY(0)';
  toast.style.opacity = '1';

  window.clearTimeout(toast.timeoutId);
  toast.timeoutId = window.setTimeout(() => {
    toast.style.transform = 'translateY(120px)';
    toast.style.opacity = '0';
  }, 3500);
}

function toggleSidebar(forceState) {
  const shouldOpen = typeof forceState === 'boolean' ? forceState : !sidebar.classList.contains('active');
  sidebar.classList.toggle('active', shouldOpen);
  sidebarOverlay.classList.toggle('active', shouldOpen);
}

menuToggleBtn?.addEventListener('click', (event) => {
  event.preventDefault();
  toggleSidebar();
});
sidebarOverlay?.addEventListener('click', () => toggleSidebar(false));

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    const nextTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  });
}

async function loadUserProfileHeader() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const redirect = encodeURIComponent('profile.html');
      window.location.href = `login.html?redirect=${redirect}`;
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;

    if (data) {
      const displayNameElement = document.querySelector('.user-profile-display-name');
      const emailElement = document.querySelector('.user-profile-bio-tagline');
      const avatarInitials = document.querySelector('.avatar-large-initials');

      if (displayNameElement) displayNameElement.textContent = data.full_name || 'SocialHub Member';
      if (emailElement) emailElement.textContent = `Active member since ${new Date(data.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} 🚀`;
      if (sidebarName) sidebarName.textContent = data.full_name || 'SocialHub User';
      if (sidebarEmail) sidebarEmail.textContent = data.email || '';
      if (sidebarAvatar && data.avatar_url) sidebarAvatar.src = data.avatar_url;

      const nameParts = (data.full_name || 'SocialHub Member').split(' ');
      const initials = nameParts.length > 1
        ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
        : nameParts[0].substring(0, 2).toUpperCase();

      if (avatarInitials) avatarInitials.textContent = initials;
    }
  } catch (error) {
    console.error('Profile matching error:', error.message);
    if (securityScore) {
      securityScore.textContent = 'Sync Offline';
      securityScore.style.color = 'var(--color-danger)';
    }
  }
}

async function loadMyLinks() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (totalLinks) totalLinks.textContent = data.length || 0;
    const viewsSum = data.reduce((sum, item) => sum + (item.member_count || 0), 0);
    if (totalViews) totalViews.textContent = viewsSum.toLocaleString();

    if (data.length === 0) {
      profileLinks.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-link-slash"></i>
          <p>You have not shared any communities yet.</p>
        </div>
      `;
      activityFeed.innerHTML = '<div class="empty-state"><i class="fa-solid fa-clock"></i><p>Your activity feed will appear here after your first submission.</p></div>';
      return;
    }

    profileLinks.innerHTML = data.map((link) => {
      let brandIcon = '';
      if (link.platform === 'WhatsApp') brandIcon = '<i class="fa-brands fa-whatsapp" style="color: #25D366;"></i>';
      else if (link.platform === 'Telegram') brandIcon = '<i class="fa-brands fa-telegram" style="color: #0088cc;"></i>';
      else brandIcon = '<i class="fa-brands fa-facebook" style="color: #1877f2;"></i>';

      let statusBadge = '';
      if (link.status === 'approved') {
        statusBadge = '<span class="status-pill status-approved">Approved</span>';
      } else if (link.status === 'pending') {
        statusBadge = '<span class="status-pill status-pending">Pending</span>';
      } else {
        statusBadge = '<span class="status-pill status-rejected">Rejected</span>';
      }

      return `
        <div class="profile-item">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 38px; height: 38px; background: var(--bg-app); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">
              ${brandIcon}
            </div>
            <div>
              <strong>${link.title}</strong>
              <p class="muted" style="font-size:0.8rem; margin-top:2px;">${link.platform} • ${link.sub_type} • ${statusBadge}</p>
            </div>
          </div>
          <button class="btn btn-ghost" data-action="delete" data-id="${link.id}">
            <i class="fa-solid fa-trash-can"></i> Delete
          </button>
        </div>
      `;
    }).join('');

    activityFeed.innerHTML = data.slice(0, 4).map((link) => `
      <div class="activity-item">
        <div>
          <strong>${link.title}</strong>
          <p>${link.status === 'approved' ? 'Approved and visible to the community' : 'Currently awaiting moderator review'}</p>
        </div>
        <span class="status-pill status-pending">${new Date(link.created_at).toLocaleDateString()}</span>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error fetching context items:', error.message);
    showToast('Your dashboard could not be refreshed right now.', true);
  }
}

profileLinks?.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-action="delete"]');
  if (!button) return;

  const id = button.dataset.id;
  const proceed = window.confirm('Do you want to delete this submission permanently?');

  if (proceed) {
    try {
      const { error } = await supabase.from('links').delete().eq('id', id);
      if (error) throw error;
      showToast('Submission removed successfully.');
      loadMyLinks();
    } catch (error) {
      showToast('The submission could not be removed.', true);
    }
  }
});

editProfileDummyBtn?.addEventListener('click', () => {
  showToast('Profile editing is currently locked while verification is being finalized.');
});

document.querySelector('[data-action="invite"]')?.addEventListener('click', () => {
  const inviteText = `${window.location.origin}/index.html - Join UfaqTech SocialHub to explore active groups!`;
  const dummyArea = document.createElement('textarea');
  document.body.appendChild(dummyArea);
  dummyArea.value = inviteText;
  dummyArea.select();
  document.execCommand('copy');
  document.body.removeChild(dummyArea);
  showToast('Invite message copied to your clipboard.');
  toggleSidebar(false);
});

document.querySelector('[data-action="guidelines"]')?.addEventListener('click', () => {
  showToast('Rules: no spam, no fake communities, and please keep links relevant.');
  toggleSidebar(false);
});

logoutBtn?.addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.href = 'login.html';
});

applyTheme();
document.addEventListener('DOMContentLoaded', () => {
  loadUserProfileHeader();
  loadMyLinks();
});