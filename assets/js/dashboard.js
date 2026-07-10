const supabaseUrl = window.UFAQTECH_SUPABASE_URL || 'https://YOUR_SUPABASE_URL.supabase.co';
const supabaseKey = window.UFAQTECH_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

async function handleOAuthRedirect() {
  if (!window.location.hash || !window.location.hash.includes('access_token')) return;

  try {
    const { error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
    if (error) throw error;
    window.location.hash = '';
  } catch (error) {
    console.warn('OAuth redirect error:', error?.message || error);
  }
}

const feedGrid = document.getElementById('feedGrid');
const searchInput = document.getElementById('searchInput');
const platformFilters = document.getElementById('platformFilters');
const categoryFilters = document.getElementById('categoryFilters');
const sortSelect = document.getElementById('sortSelect');
const createLinkBtn = document.getElementById('createLinkBtn');
const linkModal = document.getElementById('linkModal');
const linkForm = document.getElementById('linkForm');
const previewCard = document.getElementById('previewCard');
const sidebar = document.getElementById('sidebar');
const menuToggleBtn = document.getElementById('menuToggleBtn');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const closeModalBtn = document.getElementById('closeModalBtn');
const sidebarName = document.getElementById('sidebarName');
const sidebarEmail = document.getElementById('sidebarEmail');
const sidebarAvatar = document.getElementById('sidebarAvatar');
const logoutBtn = document.getElementById('logoutBtn');
const notificationBtn = document.getElementById('notificationBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const reportModal = document.getElementById('reportModal');
const reportForm = document.getElementById('reportForm');
const reportReason = document.getElementById('reportReason');
const reportLinkId = document.getElementById('reportLinkId');

const inputPlatform = document.getElementById('inputPlatform');
const inputSubType = document.getElementById('inputSubType');
const inputCategory = document.getElementById('inputCategory');
const inputMemberCount = document.getElementById('inputMemberCount');
const inputTitle = document.getElementById('inputTitle');
const inputDescription = document.getElementById('inputDescription');
const inputImageUrl = document.getElementById('inputImageUrl');
const inputUrl = document.getElementById('inputUrl');
const metadataStatus = document.getElementById('metadataStatus');

const platforms = ['All', 'WhatsApp', 'Telegram', 'Facebook'];
const categories = ['All', 'Educational', 'Programming', 'Tech', 'Funny', '18+', 'Business'];

let links = [];
let selectedPlatform = 'All';
let selectedCategory = 'All';
let searchTerm = '';
let sortMode = 'latest';
let modalReady = false;
let currentReportLinkId = '';

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

window.addEventListener('DOMContentLoaded', () => {
  handleOAuthRedirect();

  try {
    const targetModal = document.getElementById('linkModal');
    if (targetModal) {
      targetModal.setAttribute('hidden', 'true');
      targetModal.hidden = true;
      targetModal.style.display = 'none';
    }

    const triggerBtn = document.getElementById('createLinkBtn');
    if (triggerBtn) {
      triggerBtn.disabled = true;
    }

    const pageLoadTime = Date.now();
    window.setTimeout(() => {
      if (triggerBtn) triggerBtn.disabled = false;
      modalReady = true;
    }, 450);

    const preventEarlyEnter = (event) => {
      if (event.key === 'Enter' && (Date.now() - pageLoadTime < 450)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    document.body.addEventListener('keydown', preventEarlyEnter, { capture: true, passive: false });
    window.setTimeout(() => {
      document.body.removeEventListener('keydown', preventEarlyEnter, { capture: true });
    }, 550);
  } catch (error) {
    console.warn('Startup visual guard bypass:', error);
  }
});

menuToggleBtn?.addEventListener('click', (event) => {
  event.preventDefault();
  toggleSidebar();
});
sidebarOverlay?.addEventListener('click', () => toggleSidebar(false));
Array.from(document.querySelectorAll('.sidebar .nav-item')).forEach((item) => {
  item.addEventListener('click', () => toggleSidebar(false));
});

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    const nextTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  });
}

function renderFilterButtons() {
  if (!platformFilters || !categoryFilters) return;
  platformFilters.innerHTML = platforms.map((platform) => {
    let icon = '';
    if (platform === 'WhatsApp') icon = '<i class="fa-brands fa-whatsapp" style="color: #25D366; margin-right: 6px;"></i>';
    if (platform === 'Telegram') icon = '<i class="fa-brands fa-telegram" style="color: #0088cc; margin-right: 6px;"></i>';
    if (platform === 'Facebook') icon = '<i class="fa-brands fa-facebook" style="color: #1877f2; margin-right: 6px;"></i>';
    return `<button class="chip ${selectedPlatform === platform ? 'active' : ''}" data-type="platform" data-value="${platform}">${icon}${platform}</button>`;
  }).join('');

  categoryFilters.innerHTML = categories.map((category) => {
    return `<button class="chip ${selectedCategory === category ? 'active' : ''}" data-type="category" data-value="${category}">${category}</button>`;
  }).join('');
}

function sortLinks(items) {
  const list = [...items];
  if (sortMode === 'popular') {
    return list.sort((a, b) => (b.member_count || 0) - (a.member_count || 0));
  }
  return list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
}

function renderFeed() {
  const filtered = sortLinks(links.filter((link) => {
    const matchPlatform = selectedPlatform === 'All' || link.platform === selectedPlatform;
    const matchCategory = selectedCategory === 'All' || link.category === selectedCategory;
    const haystack = `${link.title || ''} ${link.platform || ''} ${link.category || ''} ${link.sub_type || ''}`.toLowerCase();
    const matchSearch = haystack.includes(searchTerm.toLowerCase());
    return matchPlatform && matchCategory && matchSearch;
  }));

  if (filtered.length === 0) {
    feedGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <i class="fa-solid fa-folder-open"></i>
        <p>No active communities match your current filters.</p>
      </div>
    `;
    return;
  }

  feedGrid.innerHTML = filtered.map((link) => {
    let defaultImg = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80';
    if (link.platform === 'WhatsApp') defaultImg = 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=400&q=80';
    if (link.platform === 'Telegram') defaultImg = 'https://images.unsplash.com/photo-1614680376593-902f74fa0d41?auto=format&fit=crop&w=400&q=80';
    if (link.platform === 'Facebook') defaultImg = 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=400&q=80';

    const cleanImg = link.image_url || defaultImg;
    let labelBadgeClass = '';
    let brandIcon = '';
    if (link.platform === 'WhatsApp') {
      labelBadgeClass = 'style="background: #e8fbf1; color: #15803d;"';
      brandIcon = '<i class="fa-brands fa-whatsapp"></i>';
    } else if (link.platform === 'Telegram') {
      labelBadgeClass = 'style="background: #f0f7ff; color: #1d4ed8;"';
      brandIcon = '<i class="fa-brands fa-telegram"></i>';
    } else {
      labelBadgeClass = 'style="background: #f8fafc; color: #475569;"';
      brandIcon = '<i class="fa-brands fa-facebook"></i>';
    }

    return `
      <article class="card">
        <img src="${cleanImg}" alt="${link.title}" onerror="this.src='${defaultImg}'" />
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
          <span class="muted" ${labelBadgeClass} style="padding: 4px 10px; border-radius: 99px; font-size: 0.75rem; font-weight: 600;">
            ${brandIcon} ${link.sub_type}
          </span>
          <span style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted); background: var(--bg-app); padding: 4px 8px; border-radius: 6px;">
            ${link.category}
          </span>
        </div>
        <h3>${link.title}</h3>
        <p class="muted" style="font-size: 0.85rem; line-height: 1.5;">${(link.description || 'A vibrant community for sharing updates, resources, and discussion.').substring(0, 140)}${(link.description || '').length > 140 ? '…' : ''}</p>
        <p class="muted" style="font-size: 0.85rem; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-users" style="color: var(--color-blue)"></i>
          <strong>${(link.member_count || 0).toLocaleString()}</strong> members / followers
        </p>
        <div class="card-actions">
          <a class="btn btn-primary btn-block" href="${link.url}" target="_blank" rel="noreferrer">
            Join Now <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.8rem;"></i>
          </a>
          <button class="btn btn-ghost btn-block" type="button" data-action="report" data-id="${link.id}">Report</button>
        </div>
      </article>
    `;
  }).join('');
}

async function loadLinks() {
  try {
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) throw error;
    links = data || [];
    renderFeed();
  } catch (error) {
    console.error('Error loading links:', error.message);
    showToast('We could not load the latest communities right now.', true);
  }
}

async function loadProfile() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    if (data) {
      sidebarName.textContent = data.full_name || 'SocialHub User';
      sidebarEmail.textContent = data.email || '';
      if (data.avatar_url) {
        sidebarAvatar.src = data.avatar_url;
      }
    }
  } catch (error) {
    console.error('Error loading profiles:', error.message);
  }
}

function openLinkModal() {
  if (!modalReady || createLinkBtn.disabled) return;
  linkModal.hidden = false;
  linkModal.style.display = 'grid';
  updateLivePreview();
  const firstField = linkModal.querySelector('input, select');
  if (firstField) firstField.focus();
}

function closeLinkModal() {
  linkModal.hidden = true;
  linkModal.style.display = 'none';
}

function openReportModal(linkId) {
  currentReportLinkId = linkId;
  reportLinkId.value = linkId;
  reportReason.value = '';
  reportModal.hidden = false;
  reportModal.style.display = 'grid';
  reportReason.focus();
}

function closeReportModal() {
  reportModal.hidden = true;
  reportModal.style.display = 'none';
}

createLinkBtn.addEventListener('click', (event) => {
  event.preventDefault();
  openLinkModal();
});
closeModalBtn.addEventListener('click', (event) => {
  event.preventDefault();
  closeLinkModal();
});
linkModal.addEventListener('click', (event) => {
  if (event.target === linkModal) {
    event.preventDefault();
    closeLinkModal();
  }
});

document.getElementById('closeReportModalBtn')?.addEventListener('click', (event) => {
  event.preventDefault();
  closeReportModal();
});
reportModal?.addEventListener('click', (event) => {
  if (event.target === reportModal) {
    event.preventDefault();
    closeReportModal();
  }
});

function updateLivePreview() {
  const platform = inputPlatform?.value || 'WhatsApp';
  const subType = inputSubType?.value || 'Group';
  const category = inputCategory?.value || 'Educational';
  const memberCount = inputMemberCount?.value || '0';
  const title = inputTitle?.value?.trim() || 'Awesome Community Title';
  const description = inputDescription?.value?.trim() || 'A fresh community ready for new members.';
  const url = inputUrl?.value || '';
  const imageUrl = inputImageUrl?.value?.trim() || '';

  let defaultImg = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80';
  if (platform === 'WhatsApp') defaultImg = 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=400&q=80';
  if (platform === 'Telegram') defaultImg = 'https://images.unsplash.com/photo-1614680376593-902f74fa0d41?auto=format&fit=crop&w=400&q=80';
  if (platform === 'Facebook') defaultImg = 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=400&q=80';
  const previewImage = imageUrl || defaultImg;

  previewCard.innerHTML = `
    <div style="display: flex; gap: 12px; align-items: center;">
      <img src="${previewImage}" alt="Preview" style="width: 58px; height: 58px; border-radius: 12px; object-fit: cover; background: #cbd5e1;" onerror="this.src='${defaultImg}'" />
      <div style="flex: 1; overflow: hidden;">
        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-bottom:4px;">
          <span style="padding: 4px 8px; border-radius: 999px; font-size: 0.72rem; font-weight: 700; background: rgba(37, 99, 235, 0.12); color: var(--color-blue);">${platform}</span>
          <span style="padding: 4px 8px; border-radius: 999px; font-size: 0.72rem; font-weight: 700; background: rgba(15, 23, 42, 0.06); color: var(--text-main);">${subType}</span>
          <span style="padding: 4px 8px; border-radius: 999px; font-size: 0.72rem; font-weight: 700; background: rgba(16, 185, 129, 0.12); color: #047857;">${category}</span>
        </div>
        <h4 style="font-size: 0.95rem; font-weight: 700; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${title}</h4>
        <p class="muted" style="font-size: 0.72rem; margin: 4px 0 0 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${url || 'URL enters here...'}</p>
        <p class="muted" style="font-size: 0.74rem; margin: 6px 0 0 0; line-height: 1.4;">${description}</p>
        ${Number(memberCount) > 0 ? `<div style="margin-top: 8px; display:inline-flex; align-items:center; gap:6px; padding: 4px 8px; border-radius: 999px; background: rgba(37, 99, 235, 0.12); color: var(--color-blue); font-size: 0.72rem; font-weight: 700;"><i class="fa-solid fa-circle"></i> ${memberCount.toLocaleString()} MEMBERS</div>` : ''}
      </div>
    </div>
  `;
}

// Helper to decode HTML entities
function decodeHtmlEntities(text) {
  if (!text) return '';
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value || text;
}

// Helper to clean up extracted text
function cleanText(text) {
  if (!text) return '';
  return decodeHtmlEntities(text)
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchLinkMetadata(url) {
  if (!url) return null;
  try {
    const trimmed = url.trim();
    const safeUrl = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    new URL(safeUrl);
    if (metadataStatus) {
      metadataStatus.textContent = 'Fetching page details...';
      metadataStatus.style.color = 'var(--color-blue)';
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const proxyUrl = `https://r.jina.ai/${safeUrl}`;
    const response = await fetch(proxyUrl, {
      headers: { Accept: 'text/plain' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error('Metadata unavailable');
    const text = await response.text();
    if (!text || text.length < 50) throw new Error('Invalid response');

    // Extract title with multiple fallback strategies
    let title = '';
    // 1. Try Open Graph title
    title = cleanText(text.match(/property=["']og:title["'][^>]*content=["']([^"']+)["']/i)?.[1] || 
             text.match(/og:title[^>]*content=["']([^"']+)["']/i)?.[1] || '');
    
    // 2. Try standard meta title
    if (!title) {
      title = cleanText(text.match(/<meta\s+name=["']title["'][^>]*content=["']([^"']+)["']/i)?.[1] || 
               text.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || '');
    }
    
    // 3. Try h1 tag as last resort
    if (!title) {
      title = cleanText(text.match(/<h1[^>]*>([^<]+)<\/h1>/i)?.[1] || '');
    }

    // Extract description with multiple fallback strategies
    let description = '';
    // 1. Try Open Graph description
    description = cleanText(text.match(/property=["']og:description["'][^>]*content=["']([^"']+)["']/i)?.[1] || 
                   text.match(/og:description[^>]*content=["']([^"']+)["']/i)?.[1] || '');
    
    // 2. Try standard meta description
    if (!description) {
      description = cleanText(text.match(/<meta\s+name=["']description["'][^>]*content=["']([^"']+)["']/i)?.[1] || '');
    }
    
    // 3. Extract from first substantive text block
    if (!description) {
      const textLines = text.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 15 && !line.includes('<') && !line.includes('http'));
      if (textLines.length > 0) {
        description = cleanText(textLines.slice(0, 1).join(' '));
      }
    }

    // Extract image URL
    let image = '';
    // 1. Try Open Graph image
    image = (text.match(/property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1] || 
             text.match(/og:image[^>]*content=["']([^"']+)["']/i)?.[1] || '').trim();
    
    // 2. Try Twitter card image
    if (!image) {
      image = (text.match(/property=["']twitter:image["'][^>]*content=["']([^"']+)["']/i)?.[1] || 
               text.match(/name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i)?.[1] || '').trim();
    }
    
    // 3. Try finding image URLs in the text
    if (!image) {
      const imageMatch = text.match(/https?:\/\/[^\s"'<>]+\.(?:png|jpe?g|gif|webp|svg|ico)/i);
      image = imageMatch?.[0] || '';
    }

    // Validate and clean results
    const finalTitle = title.substring(0, 100);
    const finalDescription = description.substring(0, 200);
    const finalImage = image && image.startsWith('http') ? image : '';

    // If we got substantial data, return it
    if (finalTitle && finalDescription) {
      return {
        title: finalTitle,
        description: finalDescription,
        imageUrl: finalImage,
      };
    }

    // If minimal data, still return what we have but warn user
    if (finalTitle || finalDescription) {
      return {
        title: finalTitle || 'Community Link',
        description: finalDescription || 'Please add a description',
        imageUrl: finalImage,
      };
    }

    throw new Error('Could not extract meaningful page data');
  } catch (error) {
    console.warn('Metadata fetch failed:', error.message);
    if (metadataStatus) {
      metadataStatus.textContent = '✏️ Metadata fetch failed - please fill details manually';
      metadataStatus.style.color = '#ef4444';
    }
    return null;
  }
}

// Debounce timer for URL input to prevent excessive fetch requests
let urlInputDebounceTimer = null;
let lastFetchedUrl = '';

async function handleUrlInputChange() {
  const url = inputUrl?.value?.trim() || '';
  
  // Skip if URL is empty
  if (!url) {
    if (metadataStatus) {
      metadataStatus.textContent = 'Paste a link to auto-fill title, description, and image preview.';
      metadataStatus.style.color = 'var(--text-muted)';
    }
    return;
  }

  // Skip if URL hasn't actually changed
  if (url === lastFetchedUrl) {
    return;
  }

  // Debounce metadata fetching to prevent too many requests
  if (urlInputDebounceTimer) {
    clearTimeout(urlInputDebounceTimer);
  }

  urlInputDebounceTimer = setTimeout(async () => {
    try {
      // Validate URL format first
      const testUrl = url.startsWith('http') ? url : `https://${url}`;
      new URL(testUrl);
    } catch {
      if (metadataStatus) {
        metadataStatus.textContent = '⚠️ Please enter a valid URL (e.g., https://...)';
        metadataStatus.style.color = '#f97316';
      }
      return;
    }

    lastFetchedUrl = url;
    const metadata = await fetchLinkMetadata(url);
    
    if (metadata && (metadata.title || metadata.description)) {
      // Only fill empty fields - preserve user edits
      if (!inputTitle?.value?.trim()) {
        inputTitle.value = metadata.title || '';
      }
      if (!inputDescription?.value?.trim()) {
        inputDescription.value = metadata.description || '';
      }
      if (!inputImageUrl?.value?.trim()) {
        inputImageUrl.value = metadata.imageUrl || '';
      }
      
      if (metadataStatus) {
        metadataStatus.textContent = '✅ Page details fetched successfully!';
        metadataStatus.style.color = '#16a34a';
      }
      updateLivePreview();
    }
  }, 800); // Wait 800ms after user stops typing before fetching
}

['change', 'input'].forEach((eventName) => {
  inputPlatform?.addEventListener(eventName, updateLivePreview);
  inputSubType?.addEventListener(eventName, updateLivePreview);
  inputCategory?.addEventListener(eventName, updateLivePreview);
  inputMemberCount?.addEventListener(eventName, updateLivePreview);
  inputTitle?.addEventListener(eventName, updateLivePreview);
  inputDescription?.addEventListener(eventName, updateLivePreview);
  inputImageUrl?.addEventListener(eventName, updateLivePreview);
  inputUrl?.addEventListener(eventName, updateLivePreview);
});

inputUrl?.addEventListener('blur', handleUrlInputChange);
inputUrl?.addEventListener('change', handleUrlInputChange);

function validateLinkSubmission(payload) {
  const errors = [];
  if (!payload.title || payload.title.trim().length < 3) errors.push('Title must be at least 3 characters.');
  if (!payload.description || payload.description.trim().length < 10) errors.push('Please add a short description with at least 10 characters.');
  if (!payload.url) errors.push('Please enter a community URL.');
  try {
    const parsed = new URL(payload.url);
    if (!['http:', 'https:'].includes(parsed.protocol)) errors.push('Use a valid http or https URL.');
  } catch {
    errors.push('Please enter a valid URL.');
  }
  return errors;
}

if (linkForm) {
  linkForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = {
      platform: inputPlatform?.value || 'WhatsApp',
      subType: inputSubType?.value || 'Group',
      category: inputCategory?.value || 'Educational',
      title: inputTitle?.value?.trim() || '',
      description: inputDescription?.value?.trim() || '',
      imageUrl: inputImageUrl?.value?.trim() || '',
      url: inputUrl?.value?.trim() || '',
      memberCount: Number(inputMemberCount?.value || 0),
    };

    const errors = validateLinkSubmission(payload);
    if (errors.length) {
      showToast(errors[0], true);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Your session expired. Please sign in again.');

      await supabase.from('profiles').upsert({
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'SocialHub User',
        email: user.email,
        role: 'user',
      }, { onConflict: 'id' });

      const { error } = await supabase.from('links').insert([{
        user_id: user.id,
        platform: payload.platform,
        sub_type: payload.subType,
        category: payload.category,
        title: payload.title,
        description: payload.description,
        image_url: payload.imageUrl,
        url: payload.url,
        member_count: payload.memberCount,
        status: 'pending',
      }]);

      if (error) throw error;

      showToast('Link Submitted. Waiting for Status Approval...');
      linkForm.reset();
      updateLivePreview();
      closeLinkModal();
      loadLinks();
    } catch (error) {
      console.error('Submit error:', error.message);
      showToast(error.message || 'Something went wrong during submission.', true);
    }
  });
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('.chip');
  if (button) {
    const { type, value } = button.dataset;
    if (type === 'platform') selectedPlatform = value;
    if (type === 'category') selectedCategory = value;
    renderFilterButtons();
    renderFeed();
    return;
  }

  const reportButton = event.target.closest('[data-action="report"]');
  if (reportButton) {
    openReportModal(reportButton.dataset.id);
  }
});

if (searchInput) {
  searchInput.addEventListener('input', (event) => {
    searchTerm = event.target.value;
    renderFeed();
  });
}

if (sortSelect) {
  sortSelect.addEventListener('change', (event) => {
    sortMode = event.target.value;
    renderFeed();
  });
}

notificationBtn?.addEventListener('click', () => {
  showToast('No new alerts right now. Your next review is ready.');
});

document.querySelector('[data-action="invite"]')?.addEventListener('click', () => {
  const inviteText = `${window.location.origin}/index.html - Join UfaqTech SocialHub to advertise and explore active group links!`;
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

if (reportForm) {
  reportForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const reason = reportReason.value.trim();
    if (!reason) {
      showToast('Please describe the issue before sending your report.', true);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please sign in to report this community.');

      const { error } = await supabase.from('reports').insert([{
        link_id: currentReportLinkId,
        reported_by: user.id,
        reason,
        is_resolved: false,
      }]);

      if (error) throw error;
      showToast('Report sent successfully. The moderation team will review it soon.');
      closeReportModal();
    } catch (error) {
      console.error('Report submission error:', error.message);
      showToast(error.message || 'We could not submit your report.', true);
    }
  });
}

applyTheme();
renderFilterButtons();
loadProfile();
loadLinks();