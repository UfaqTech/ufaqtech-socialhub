/**
 * Enhanced Community Link Submission Form Handler
 * Provides real-time preview, auto-detection, and form validation
 */

document.addEventListener('DOMContentLoaded', function() {
  // Form Elements Setup
  const urlInput = document.getElementById('inputUrl');
  const titleInput = document.getElementById('inputTitle');
  const descInput = document.getElementById('inputDescription');
  const imgInput = document.getElementById('inputImageUrl');
  const platformSelect = document.getElementById('inputPlatform');
  const subTypeSelect = document.getElementById('inputSubType');
  const categorySelect = document.getElementById('inputCategory');
  const memberInput = document.getElementById('inputMemberCount');
  
  const statusText = document.getElementById('metadataStatus');
  const memberHint = document.getElementById('memberHint');
  const previewCard = document.getElementById('previewCard');
  const linkForm = document.getElementById('linkForm');
  const createLinkBtn = document.getElementById('createLinkBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const linkModal = document.getElementById('linkModal');

  // Modal Management
  function openModal() {
    linkModal.hidden = false;
    linkModal.style.display = 'grid';
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    linkModal.hidden = true;
    linkModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    resetForm();
  }

  function resetForm() {
    linkForm.reset();
    statusText.className = '';
    statusText.textContent = 'Paste a link above to auto-fill details & view live preview.';
    updateLivePreview();
  }

  const memberLimits = {
    WhatsApp: { min: 1, max: 1024, label: '1–1,024 members' },
    Telegram: { min: 1, max: 2000000, label: '1–2,000,000 members' },
    Facebook: { min: 1, max: 10000000, label: '1–10,000,000 followers' },
    default: { min: 1, max: 1000000, label: '1–1,000,000 members/followers' },
  };

  function updateMemberLimits(platform) {
    const limits = memberLimits[platform] || memberLimits.default;
    if (memberInput) {
      memberInput.min = limits.min;
      memberInput.max = limits.max;
    }
    if (memberHint) {
      memberHint.textContent = `${platform} limit: ${limits.label}. Adjust the value to fit the community size.`;
    }
  }

  function validateMemberCount() {
    const value = Number(memberInput.value || 0);
    const platform = platformSelect.value || 'WhatsApp';
    const limits = memberLimits[platform] || memberLimits.default;

    if (!memberInput.value.trim()) {
      return { valid: true, message: '' };
    }
    if (value < limits.min) {
      return { valid: false, message: `Enter at least ${limits.min} members/followers for ${platform}.` };
    }
    if (value > limits.max) {
      return { valid: false, message: `For ${platform}, the maximum members/followers is ${limits.max.toLocaleString()}.` };
    }
    return { valid: true, message: '' };
  }

  // Event Listeners for Modal Control
  createLinkBtn.addEventListener('click', openModal);
  closeModalBtn.addEventListener('click', closeModal);

  // Close modal when clicking outside
  linkModal.addEventListener('click', function(e) {
    if (e.target === linkModal) {
      closeModal();
    }
  });

  // Close modal on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && linkModal.hidden === false) {
      closeModal();
    }
  });

  // Live Synchronized Event Listeners for standard typing modifications
  const formInputs = [titleInput, descInput, imgInput, platformSelect, subTypeSelect, categorySelect, memberInput];
  formInputs.forEach(input => {
    input.addEventListener('input', updateLivePreview);
    input.addEventListener('change', updateLivePreview);
  });

  platformSelect.addEventListener('change', () => {
    updateMemberLimits(platformSelect.value);
    updateLivePreview();
  });

  updateMemberLimits(platformSelect.value || 'WhatsApp');

  // Detect pasting/typing into the URL space
  urlInput.addEventListener('input', async (e) => {
    const urlValue = e.target.value.trim();
    
    // Auto-detect Platform based on string matching
    if (urlValue.includes('whatsapp.com')) platformSelect.value = 'WhatsApp';
    else if (urlValue.includes('t.me')) platformSelect.value = 'Telegram';
    else if (urlValue.includes('facebook.com')) platformSelect.value = 'Facebook';

    updateMemberLimits(platformSelect.value);

    // Check if URL looks solid before firing metadata fetcher
    if (urlValue.startsWith('http://') || urlValue.startsWith('https://')) {
      await fetchMetadata(urlValue);
    } else {
      updateLivePreview();
    }
  });

  // Simulated Metadata Extraction (will be replaced with backend call)
  async function fetchMetadata(url) {
    statusText.className = 'loading';
    statusText.innerHTML = '⏳ Detecting link details & extracting metadata...';
    
    // Artificial delay (1.2 seconds) to look responsive and premium
    await new Promise(resolve => setTimeout(resolve, 1200));

    let extractedData = {
      title: 'Global Tech Hub',
      desc: 'A compiled networking ecosystem discussing structural software architectures, web developments, and modern frameworks.',
      img: 'https://picsum.photos/120',
      subType: 'Group',
      category: 'Tech',
      members: '4200'
    };

    // Altering mock payload based on URL context clues
    if (url.includes('t.me')) {
      extractedData.title = 'Telegram Dev Channel';
      extractedData.desc = 'Official announcements, build schedules, and API deployment structures regarding production modules.';
      extractedData.subType = 'Channel';
      extractedData.category = 'Programming';
      extractedData.members = '12800';
    } else if (url.includes('facebook.com')) {
      extractedData.title = 'UI/UX Designers Guild';
      extractedData.desc = 'A community-driven Facebook page reviewing design trends, web assets, and product management workflows.';
      extractedData.subType = 'Page';
      extractedData.category = 'Business';
      extractedData.members = '24500';
    } else if (url.includes('whatsapp.com')) {
      const inviteIdMatch = url.match(/chat\.whatsapp\.com\/(\w+)/i);
      const inviteId = inviteIdMatch ? inviteIdMatch[1] : '';
      extractedData.title = 'WhatsApp Community';
      extractedData.desc = 'Join our WhatsApp discussion group for community networking and resources.';
      extractedData.subType = 'Group';
      extractedData.category = 'Educational';
      extractedData.members = '1024';
      extractedData.img = inviteId
        ? `https://pps.whatsapp.net/v/t61.24694-24/${inviteId}.jpg?oh=placeholder&oe=placeholder`
        : 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=400&q=80';
    }

    // Populate Input Fields dynamically
    titleInput.value = extractedData.title;
    descInput.value = extractedData.desc;
    imgInput.value = extractedData.img;
    subTypeSelect.value = extractedData.subType;
    categorySelect.value = extractedData.category;
    memberInput.value = extractedData.members;

    // Status Notification Update
    statusText.className = 'success';
    statusText.innerHTML = '✅ Metadata fetched and fields applied successfully!';
    
    // Repopulate live preview elements
    updateLivePreview();
  }

  // Function to render preview card instantly
  function updateLivePreview() {
    const title = titleInput.value.trim();
    const desc = descInput.value.trim();
    const img = imgInput.value.trim();
    const platform = platformSelect.value;
    const subType = subTypeSelect.value;
    const members = memberInput.value ? parseInt(memberInput.value).toLocaleString() : null;

    // Render default placeholder status if critical fields are blank
    if (!title && !desc) {
      previewCard.className = 'preview-card-display';
      previewCard.innerHTML = `<div class="placeholder-text">Fill out the form or paste a URL to see live card preview</div>`;
      return;
    }

    previewCard.className = 'preview-card-display populated';
    
    // Format structural components inside Live Preview Dynamic Element Box
    const imgMarkup = img 
      ? `<img src="${img}" class="preview-image" alt="Preview Image" onerror="this.src='https://via.placeholder.com/70?text=No+Image'">`
      : `<div class="preview-image">🌐</div>`;

    const metaDetails = `${platform} ${subType} ${members ? `• ${members} members` : ''}`;

    previewCard.innerHTML = `
      ${imgMarkup}
      <div class="preview-info">
        <div class="preview-meta">${metaDetails}</div>
        <div class="preview-title">${title || 'Untitled Community'}</div>
        <div class="preview-desc">${desc || 'No description provided yet...'}</div>
      </div>
    `;
  }

  // Form Submission Handler
  linkForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!titleInput.value.trim() || !descInput.value.trim() || !urlInput.value.trim()) {
      alert('⚠️ Please fill in all required fields.');
      return;
    }

    const memberValidation = validateMemberCount();
    if (!memberValidation.valid) {
      alert(`⚠️ ${memberValidation.message}`);
      return;
    }

    // Show loading state
    const submitBtn = linkForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Submitting...';

    try {
      // Prepare form data for Supabase
      const formData = {
        url: urlInput.value.trim(),
        title: titleInput.value.trim(),
        description: descInput.value.trim(),
        image_url: imgInput.value.trim() || '',
        platform: platformSelect.value,
        sub_type: subTypeSelect.value,
        category: categorySelect.value,
        member_count: memberInput.value ? parseInt(memberInput.value) : 0,
        status: 'pending',
        submitted_at: new Date().toISOString(),
        submitted_by: (function(){
          try { const s = JSON.parse(localStorage.getItem('session')||'{}'); return s.user?.id || null; } catch(e){ return null; }
        })()
      };

      // Initialize Supabase client (uses globals from assets/js/config.js)
      const supabaseClient = window.supabase || (window.supabase = supabase.createClient(window.UFAQTECH_SUPABASE_URL, window.UFAQTECH_SUPABASE_ANON_KEY));

      const { data, error } = await supabaseClient
        .from('communities')
        .insert([formData])
        .select();

      if (error) throw error;

      // Success feedback
      alert('🚀 Link submitted successfully for review! Thank you for contributing.');
      closeModal();

    } catch (error) {
      console.error('Form submission error:', error);
      alert(`❌ Error submitting form: ${error.message}\n\nPlease try again.`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });

  // Get auth token from localStorage or Supabase session
  function getAuthToken() {
    try {
      const session = JSON.parse(localStorage.getItem('session') || '{}');
      return session.access_token || '';
    } catch (e) {
      console.warn('Could not retrieve auth token:', e);
      return '';
    }
  }

  // Initialize preview on page load
  updateLivePreview();
});
