      // Live preview + Microlink scraper integration for Submit Modal
      (function(){
        const createBtn = document.getElementById('createLinkBtn');
        const linkModal = document.getElementById('linkModal');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const linkForm = document.getElementById('linkForm');
        const inputUrl = document.getElementById('inputUrl');
        const inputTitle = document.getElementById('inputTitle');
        const inputDescription = document.getElementById('inputDescription');
        const inputImageUrl = document.getElementById('inputImageUrl');
        const inputPlatform = document.getElementById('inputPlatform');
        const inputCategory = document.getElementById('inputCategory');
        const inputMemberCount = document.getElementById('inputMemberCount');
        const inputSubType = document.getElementById('inputSubType');
        const metadataStatus = document.getElementById('metadataStatus');
        const previewCard = document.getElementById('previewCard');

        function showModal(){ linkModal.hidden = false; linkModal.style.display = 'block'; document.body.style.overflow = 'hidden'; }
        function hideModal(){ linkModal.hidden = true; linkModal.style.display = 'none'; document.body.style.overflow = ''; }

        createBtn && createBtn.addEventListener('click', (e)=>{ e.preventDefault(); showModal(); });
        closeModalBtn && closeModalBtn.addEventListener('click', (e)=>{ e.preventDefault(); hideModal(); });
        // close when clicking outside the modal card
        linkModal && linkModal.addEventListener('click', (e)=>{ if(e.target === linkModal) hideModal(); });

        function detectPlatform(url){
          if(!url) return 'Website';
          const u = url.toLowerCase();
          if(u.includes('chat.whatsapp.com') || u.includes('whatsapp.com')) return 'WhatsApp';
          if(u.includes('t.me') || u.includes('telegram.me') || u.includes('telegram')) return 'Telegram';
          if(u.includes('facebook.com')) return 'Facebook';
          if(u.includes('discord.gg') || u.includes('discord.com')) return 'Discord';
          if(u.includes('youtube.com') || u.includes('youtu.be')) return 'YouTube';
          return 'Website';
        }

        function renderPreview(){
          const title = (inputTitle && inputTitle.value.trim()) || 'Untitled Community';
          const desc = (inputDescription && inputDescription.value.trim()) || 'Paste a link to auto-fill details.';
          const url = (inputUrl && inputUrl.value.trim()) || '';
          const img = (inputImageUrl && inputImageUrl.value.trim()) || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800';
          const platform = (inputPlatform && inputPlatform.value) || detectPlatform(url);
          const category = (inputCategory && inputCategory.value) || 'General';
          const members = (inputMemberCount && inputMemberCount.value) || '0';

          previewCard.innerHTML = `
            <div class="card-preview">
              <div class="card-media">
                <img src="${img}" alt="preview" onerror="this.src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800'" />
                <div class="card-badge">${platform}</div>
              </div>
              <div class="card-body">
                <h4 class="card-title">${escapeHtml(title)}</h4>
                <p class="card-desc">${escapeHtml(desc)}</p>
                <div class="card-meta">
                  <span class="card-category">${escapeHtml(category)}</span>
                  <span class="card-members">${members} members</span>
                </div>
                <div class="card-url">${escapeHtml(url)}</div>
              </div>
            </div>
          `;
        }

        function escapeHtml(s){ return String(s).replace(/[&<>\"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]; }); }

        // wire inputs for realtime preview
        [inputTitle,inputDescription,inputImageUrl,inputPlatform,inputCategory,inputMemberCount].forEach(el => {
          if(!el) return; el.addEventListener('input', renderPreview);
        });

        // fetch metadata from Microlink when URL is pasted or on blur
        let fetchTimer = null;
        async function fetchMetadataFor(url){
          if(!url) return;
          metadataStatus.textContent = 'Fetching metadata...';
          try{
            const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`);
            const json = await res.json();
            if(json && json.status === 'success' && json.data){
              const d = json.data;
              if(d.title && inputTitle) inputTitle.value = d.title;
              if(d.description && inputDescription) inputDescription.value = d.description;
              if(d.image && d.image.url && inputImageUrl) inputImageUrl.value = d.image.url;
              if(inputPlatform) inputPlatform.value = detectPlatform(url) || inputPlatform.value;
              metadataStatus.textContent = 'Metadata loaded.';
            } else {
              metadataStatus.textContent = 'No metadata found for this URL.';
            }
          }catch(err){
            console.error('Metadata fetch error', err);
            metadataStatus.textContent = 'Failed to fetch metadata.';
          } finally { renderPreview(); }
        }

        inputUrl && inputUrl.addEventListener('input', (e)=>{
          metadataStatus.textContent = '';
          if(fetchTimer) clearTimeout(fetchTimer);
          fetchTimer = setTimeout(()=>{
            const url = inputUrl.value.trim();
            if(!url) return; if(!/^https?:\/\//i.test(url)) return;
            fetchMetadataFor(url);
            // auto detect platform
            if(inputPlatform) inputPlatform.value = detectPlatform(url);
          }, 600);
          renderPreview();
        });

        // also support paste event to trigger immediate fetch
        inputUrl && inputUrl.addEventListener('paste', (e)=>{
          setTimeout(()=>{ const url = inputUrl.value.trim(); if(/^https?:\/\//i.test(url)) fetchMetadataFor(url); }, 50);
        });

        // form submit: replace this with actual saving logic (Supabase or API call)
        linkForm && linkForm.addEventListener('submit', (e)=>{
          e.preventDefault();
          const payload = {
            url: inputUrl.value.trim(),
            title: inputTitle.value.trim(),
            description: inputDescription.value.trim(),
            image: inputImageUrl.value.trim(),
            platform: inputPlatform.value,
            category: inputCategory.value,
            subtype: inputSubType.value,
            members: inputMemberCount.value
          };
          console.log('Prepared link payload:', payload);
          metadataStatus.textContent = 'Payload prepared. Closing modal…';
          setTimeout(()=>{ hideModal(); metadataStatus.textContent = 'Paste a link above to auto-fill details & view live preview.'; linkForm.reset(); renderPreview(); }, 700);
        });

        // initialise preview
        renderPreview();
      })();
  