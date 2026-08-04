/* =====================================================
   コンテンツデータ
   ここを書き換えるだけで表示内容を更新できます。

   ポイント:
   ・date は "YYYY-MM-DD" 形式で入力してください（新しい順に自動で並び替わります）
   ・新しい作品を配列に追加するだけで、一覧に自動で反映されます
     （新しい方が自動で先頭に来ます）
   ・category は左メニューのカテゴリ絞り込みに使われます。
     ORIGINAL: "mv" / "releases" / "design" / "others" のいずれか
     WORKS   : "video" / "music" / "design" / "others" のいずれか
     複数のカテゴリに出したい場合は category: ["video", "music"] のように配列でもOKです
   ===================================================== */

// ORIGINAL（オリジナル楽曲のMV）
// id: 一意のID（英数字。詳細ビューの表示に使うので他と被らないようにしてください）
// youtubeId: 動画URLの v= のあとの11文字
// thumbnail: サムネイル画像を自分で指定したい場合はこちらに画像のパスを書いてください（省略可）
//            指定した場合はそちらが優先され、省略した場合はYouTubeのサムネイルが自動で使われます
//            画像は assets/original/ フォルダに置くのがおすすめです（WORKSのassets/works/と同じ考え方です）
// link: 指定すると、サムネイルをクリックしたときに詳細ビューを開く代わりに、このURLへ直接移動します（省略可・新しいタブで開きます）



// mvのデータは data/mv.json から読み込みます（下の loadContentData() を参照）
// 各項目には body（詳細ページの本文、Markdown形式）が追加されています
let mv = [];

// releases のデータは data/releases.json から読み込みます（下の loadContentData() を参照）
let releases = [];

// originalDesign のデータは data/design.json から読み込みます（下の loadContentData() を参照）
let originalDesign = [];
// originalOthers のデータは data/others.json から読み込みます（下の loadContentData() を参照）
let originalOthers = [];

// mv.jsonの読み込みが終わるまでは releases/design/others だけの状態になっています
// loadContentData() の中で mv.json 読み込み後に組み直されます
let mvWorks = [...mv, ...releases, ...originalDesign, ...originalOthers];

// MV以外の制作物
// id: 一意のID(英数字。詳細ビューの表示に使うので他と被らないようにしてください)
// thumbnail: サムネイル画像のパス（assets/works/ フォルダに画像を置いて指定してください）
// youtubeId: 動画がある作品の場合のみ指定してください（省略可）。指定すると詳細ビューでその場で動画が再生できます
// desc: 一覧に出す短い説明（ひとこと）
// detail: 詳細ビューに出す長めの説明（省略した場合は desc がそのまま使われます）
// link: 指定すると、サムネイルをクリックしたときに詳細ビューを開く代わりに、このURLへ直接移動します（省略可・新しいタブで開きます）
// worksのデータ(video/music/design/others)は data/works.json から読み込みます
// detail が詳細ページの本文（Markdown形式）として使われます
let otherWorks = [];


// ブログ記事
// blogPostsのデータは data/blog.json から読み込みます（下の loadContentData() を参照）
let blogPosts = [];

// 「椎野が最近聴いている曲！」ページ（アイコンをクリックすると表示）。ちょうど4曲になるようにしてください
const listeningSongs = [
  { title: "さよならできなくてごめんね - Ç¢Çª", youtubeId: "RRAz-XMdJ3w" },
  { title: "ウザ - 城戸胎生", youtubeId: "YDENY5-ZI2E" },
  { title: "転がるくせ - 椎野乃々", youtubeId: "p0gfjEGm-Bc" },
  { title: "もう二度と会えないといいね！- kaza", youtubeId: "BhheEkdarXI" },
];

/* =====================================================
   共通ユーティリティ
   ===================================================== */
function byNewest(a, b){ return new Date(b.date) - new Date(a.date); }
function formatDate(dateStr){ return dateStr.replace(/-/g, '.'); }

/* =====================================================
   LISTENING（アイコンをクリックした時のページ）
   サムネイルをクリックすると、その場で動画に差し替わって再生できます
   ===================================================== */
function renderListening(){
  const grid = document.getElementById('listeningGrid');
  if(!grid) return;

  const renderItem = (song, i) => {
    const isSmall = (i === 1 || i === 2); // 2番目・3番目は小さいサイズ（縦型スマホのときだけ効く）
    return `
    <div class="listening-item${isSmall ? ' listening-item--small' : ''}" data-index="${i}">
      <div class="listening-item__thumb">
        <img src="https://img.youtube.com/vi/${song.youtubeId}/maxresdefault.jpg" alt="${song.title}" loading="lazy">
        <span class="listening-item__play"></span>
      </div>
      <p class="listening-item__title">${song.title}</p>
    </div>`;
  };

  // 4つ丸ごとの「格子」ではなく、上段・下段それぞれの中で2つが隙間なく並ぶ形にする
  grid.innerHTML = `
    <div class="listening-row">
      ${renderItem(listeningSongs[0], 0)}
      ${renderItem(listeningSongs[1], 1)}
    </div>
    <div class="listening-row">
      ${renderItem(listeningSongs[2], 2)}
      ${renderItem(listeningSongs[3], 3)}
    </div>
  `;

  grid.querySelectorAll('.listening-item').forEach(item => {
    item.addEventListener('click', () => {
      const song = listeningSongs[item.dataset.index];
      if(!song) return;
      const thumb = item.querySelector('.listening-item__thumb');
      thumb.innerHTML = `<iframe src="https://www.youtube.com/embed/${song.youtubeId}?autoplay=1" title="${song.title}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    }, { once: true });
  });
}

/* =====================================================
   サムネイル一覧の描画（ORIGINAL・WORKS共通）
   type: 'original' または 'work'
   ===================================================== */
function isVideoFile(src){
  return !!src && /\.(mp4|webm|mov)(\?|$)/i.test(src);
}

function renderThumbList(containerId, items, type){
  const container = document.getElementById(containerId);
  if(!container) return;

  container.innerHTML = items.map(item => {
    if(type === 'original'){
      const thumbSrc = item.thumbnail ? item.thumbnail : `https://img.youtube.com/vi/${item.youtubeId}/maxresdefault.jpg`;
      const thumbHtml = isVideoFile(thumbSrc)
        ? `<video src="${thumbSrc}" muted autoplay loop playsinline onerror="this.remove()"></video>`
        : `<img src="${thumbSrc}" alt="${item.title}" loading="lazy" onerror="this.remove()">`;
      const isDesign = matchesCategory(item, 'design');
      const isLink = !isDesign && !!item.link;
      const tag = isLink ? 'a' : 'div';
      const linkAttrs = isLink ? ` href="${item.link}" target="_blank" rel="noopener"` : '';
      const designAttr = isDesign ? ' data-design="true"' : '';
      return `
        <${tag} class="thumb-item" data-item-id="${item.id}"${linkAttrs}${designAttr}>
          <div class="thumb-item__thumb">
            ${thumbHtml}
          </div>
          <p class="thumb-item__title">${item.title}</p>
          <div class="thumb-item__row">
            <p class="thumb-item__desc">${item.artist}</p>
            <span class="thumb-item__date">${formatDate(item.date)}</span>
          </div>
        </${tag}>`;
    }
    const thumbSrc = item.youtubeId ? `https://img.youtube.com/vi/${item.youtubeId}/maxresdefault.jpg` : item.thumbnail;
    const thumbHtml = isVideoFile(thumbSrc)
      ? `<video src="${thumbSrc}" muted autoplay loop playsinline onerror="this.remove()"></video>`
      : `<img src="${thumbSrc}" alt="${item.title}" loading="lazy" onerror="this.remove()">`;
    const isLink = !!item.link;
    const tag = isLink ? 'a' : 'div';
    const linkAttrs = isLink ? ` href="${item.link}" target="_blank" rel="noopener"` : '';
    return `
      <${tag} class="thumb-item" data-item-id="${item.id}"${linkAttrs}>
        <div class="thumb-item__thumb">
          ${thumbHtml}
        </div>
        <p class="thumb-item__title">${item.title}</p>
        <div class="thumb-item__row">
          <p class="thumb-item__desc">${item.desc}</p>
          <span class="thumb-item__date">${formatDate(item.date)}</span>
        </div>
      </${tag}>`;
  }).join('');

  container.querySelectorAll('.thumb-item').forEach(el => {
    if(el.hasAttribute('href')) return; // 外部リンクの作品はブラウザ標準の遷移に任せる
    el.addEventListener('click', () => {
      if(type === 'original'){
        if(el.dataset.design === 'true') openDesignLightbox(el.dataset.itemId);
        else openOriginalDetail(el.dataset.itemId);
      }else{
        openWorkDetail(el.dataset.itemId);
      }
    });
  });
}

function renderBlog(containerId){
  const container = document.getElementById(containerId);
  if(!container) return;

  const sorted = [...blogPosts].sort(byNewest);
  const limit = container.dataset.limit ? parseInt(container.dataset.limit, 10) : sorted.length;
  const items = sorted.slice(0, limit);

  container.innerHTML = items.map(p => `
    <li class="blog-item">
      <span class="blog-item__date">${formatDate(p.date)}</span>
      <span class="blog-item__body">
        <span class="blog-item__title">${p.title}</span>
        <span class="blog-item__excerpt">${p.excerpt}</span>
      </span>
    </li>
  `).join('');

  container.querySelectorAll('.blog-item').forEach((el, i) => {
    el.addEventListener('click', () => openBlogDetail(items[i]));
  });
}

/* =====================================================
   BLOG 詳細ビュー（クリックした記事の内容を差し込む）
   ===================================================== */
function openBlogDetail(post){
  document.getElementById('blogDetailDate').textContent = formatDate(post.date);
  document.getElementById('blogDetailTitle').textContent = post.title;
  const blogBodyEl = document.getElementById('blogDetailBody');
  // ひとこと説明(excerpt)はmvのアーティスト名と同じスタイル(detail-artist)で表示し、空欄なら何も出さない
  const excerptHtml = post.excerpt ? `<p class="detail-artist">${post.excerpt}</p>` : '';
  const bodyHtml = post.body ? renderMarkdown(post.body) : '';
  blogBodyEl.innerHTML = excerptHtml + bodyHtml;
  groupConsecutiveImages(blogBodyEl);
  enableImageZoom(blogBodyEl);
  enhanceYoutubeEmbeds(blogBodyEl);
  enhanceTweetEmbeds(blogBodyEl);
  updateBottomBackVisibility(!!(post.body && post.body.trim()), 'blogDetailBackBottom');

  switchPanel('blog-detail', true);
  if(post.id) setUrlPath(`/blog/${post.id}`);
}

/* =====================================================
   ORIGINAL 詳細ビュー（サムネイルクリックで動画を差し込む）
   ===================================================== */
function openOriginalDetail(id){
  const w = mvWorks.find(x => x.id === id);
  if(!w) return;

  // 「← back」で戻る先のカテゴリ一覧を、先に裏側で組み立てておく
  // (更新ボタンでこの詳細ページに直接入ってきた場合、一覧ページが
  //  一度も作られないまま back を押すと空欄になってしまうため)
  const detailCategory = Array.isArray(w.category) ? w.category[0] : w.category;
  populateCategoryView('original', detailCategory);

  const media = document.getElementById('originalDetailMedia');
  if(w.youtubeId){
    media.innerHTML = `<iframe src="https://www.youtube.com/embed/${w.youtubeId}" title="${w.title}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  }else if(isVideoFile(w.thumbnail)){
    media.innerHTML = `<video src="${w.thumbnail}" controls playsinline></video>`;
  }else{
    media.innerHTML = `<img src="${w.thumbnail}" alt="${w.title}" onerror="this.remove()">`;
  }
  document.getElementById('originalDetailTitle').textContent = w.title;
  // アーティスト名は今まで通り表示しつつ、body（Markdown本文）があればその下に表示します
  const bodyHtml = w.body ? renderMarkdown(w.body) : '';
  const originalBodyEl = document.getElementById('originalDetailBody');
  originalBodyEl.innerHTML = `<p class="detail-artist">${w.artist || ''}</p>${bodyHtml}`;
  groupConsecutiveImages(originalBodyEl);
  enableImageZoom(originalBodyEl);
  enhanceYoutubeEmbeds(originalBodyEl);
  enhanceTweetEmbeds(originalBodyEl);
  updateBottomBackVisibility(!!(w.body && w.body.trim()), 'originalDetailBackBottom');

  switchPanel('original-detail', true);
  setUrlPath(`/original/${id}`);
}

/* =====================================================
   ORIGINAL「design」カテゴリ用のライトボックス
   画像をクリックすると拡大表示され、左右の矢印で同じカテゴリの
   他の画像に移動できます（シンプルなフェードで切り替わります）
   ===================================================== */
let lightboxItems = [];
let lightboxIndex = 0;

function openDesignLightbox(clickedId){
  lightboxItems = mvWorks.filter(w => matchesCategory(w, 'design')).sort(byNewest);
  const foundIndex = lightboxItems.findIndex(w => w.id === clickedId);
  lightboxIndex = foundIndex === -1 ? 0 : foundIndex;

  const lightbox = document.getElementById('designLightbox');
  if(!lightbox) return;

  showLightboxImage(lightboxIndex, false);
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');

  const multiple = lightboxItems.length > 1;
  document.getElementById('lightboxPrev').style.display = multiple ? '' : 'none';
  document.getElementById('lightboxNext').style.display = multiple ? '' : 'none';
}

function showLightboxImage(index, animate){
  const item = lightboxItems[index];
  if(!item) return;
  const img = document.getElementById('designLightboxImg');
  const title = document.getElementById('designLightboxTitle');

  const src = item.thumbnail ? item.thumbnail : `https://img.youtube.com/vi/${item.youtubeId}/maxresdefault.jpg`;

  resetLightboxZoom(); // 画像を切り替えたら拡大率を元に戻す

  if(animate){
    img.style.opacity = '0';
    setTimeout(() => {
      img.src = src;
      img.alt = item.title;
      img.style.opacity = '1';
    }, 150);
  }else{
    img.src = src;
    img.alt = item.title;
    img.style.opacity = '1';
  }
  title.textContent = item.title;
}

function closeDesignLightbox(){
  const lightbox = document.getElementById('designLightbox');
  if(!lightbox) return;
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  resetLightboxZoom(); // 次に開いたときのために拡大率を元に戻す
}

function showPrevLightboxImage(){
  if(lightboxItems.length === 0) return;
  lightboxIndex = (lightboxIndex - 1 + lightboxItems.length) % lightboxItems.length;
  showLightboxImage(lightboxIndex, true);
}

function showNextLightboxImage(){
  if(lightboxItems.length === 0) return;
  lightboxIndex = (lightboxIndex + 1) % lightboxItems.length;
  showLightboxImage(lightboxIndex, true);
}

document.getElementById('designLightboxClose')?.addEventListener('click', closeDesignLightbox);
document.getElementById('designLightboxBackdrop')?.addEventListener('click', closeDesignLightbox);
document.getElementById('lightboxPrev')?.addEventListener('click', showPrevLightboxImage);
document.getElementById('lightboxNext')?.addEventListener('click', showNextLightboxImage);
document.addEventListener('keydown', (e) => {
  const lightbox = document.getElementById('designLightbox');
  if(!lightbox || !lightbox.classList.contains('is-open')) return;
  if(e.key === 'Escape') closeDesignLightbox();
  if(e.key === 'ArrowLeft') showPrevLightboxImage();
  if(e.key === 'ArrowRight') showNextLightboxImage();
});

// マウスホイールで拡大縮小、拡大しているときはクリックしてつまんで画像を動かせる
const LIGHTBOX_MIN_ZOOM = 1;
const LIGHTBOX_MAX_ZOOM = 4;   // 画面いっぱいくらいまで拡大できるようにする
const LIGHTBOX_ZOOM_STEP = 0.25;
let lightboxZoomScale = 1;
let lightboxPanX = 0;
let lightboxPanY = 0;

function applyLightboxTransform(){
  const img = document.getElementById('designLightboxImg');
  if(img) img.style.transform = `translate(${lightboxPanX}px, ${lightboxPanY}px) scale(${lightboxZoomScale})`;
}

function resetLightboxZoom(){
  lightboxZoomScale = 1;
  lightboxPanX = 0;
  lightboxPanY = 0;
  applyLightboxTransform();
  const wrap = document.getElementById('designLightboxImgWrap');
  if(wrap) wrap.style.cursor = 'zoom-in';
}

(function initLightboxZoom(){
  const wrap = document.getElementById('designLightboxImgWrap');
  const img = document.getElementById('designLightboxImg');
  if(!wrap || !img) return;

  img.style.transformOrigin = 'center center';

  wrap.addEventListener('wheel', (e) => {
    e.preventDefault(); // ページ自体がスクロールしてしまわないようにする

    lightboxZoomScale += e.deltaY < 0 ? LIGHTBOX_ZOOM_STEP : -LIGHTBOX_ZOOM_STEP;
    lightboxZoomScale = Math.max(LIGHTBOX_MIN_ZOOM, Math.min(LIGHTBOX_MAX_ZOOM, lightboxZoomScale));

    if(lightboxZoomScale <= LIGHTBOX_MIN_ZOOM){
      lightboxPanX = 0;
      lightboxPanY = 0;
    }
    applyLightboxTransform();
    wrap.style.cursor = lightboxZoomScale > LIGHTBOX_MIN_ZOOM ? 'grab' : 'zoom-in';
  }, { passive: false });

  // 拡大しているときだけ、クリックしてつまんで画像を動かせる
  let isDragging = false;
  let dragStartX = 0, dragStartY = 0;
  let panStartX = 0, panStartY = 0;

  wrap.addEventListener('mousedown', (e) => {
    if(lightboxZoomScale <= LIGHTBOX_MIN_ZOOM) return;
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    panStartX = lightboxPanX;
    panStartY = lightboxPanY;
    wrap.style.cursor = 'grabbing';
    img.style.transition = 'opacity .15s ease'; // ドラッグ中は移動のtransitionを切って追従を良くする
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if(!isDragging) return;
    lightboxPanX = panStartX + (e.clientX - dragStartX);
    lightboxPanY = panStartY + (e.clientY - dragStartY);
    applyLightboxTransform();
  });

  window.addEventListener('mouseup', () => {
    if(!isDragging) return;
    isDragging = false;
    wrap.style.cursor = lightboxZoomScale > LIGHTBOX_MIN_ZOOM ? 'grab' : 'zoom-in';
    img.style.transition = 'opacity .15s ease, transform .1s ease';
  });
})();

/* =====================================================
   WORKS 詳細ビュー（サムネイルクリックで内容を差し込む）
   ===================================================== */
function openWorkDetail(id){
  const w = otherWorks.find(x => x.id === id);
  if(!w) return;

  // 「← back」で戻る先のカテゴリ一覧を、先に裏側で組み立てておく
  // (更新ボタンでこの詳細ページに直接入ってきた場合、一覧ページが
  //  一度も作られないまま back を押すと空欄になってしまうため)
  const detailCategory = Array.isArray(w.category) ? w.category[0] : w.category;
  populateCategoryView('works', detailCategory);

  const media = document.getElementById('workDetailMedia');
  if(w.youtubeId){
    media.innerHTML = `<iframe src="https://www.youtube.com/embed/${w.youtubeId}" title="${w.title}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  }else if(isVideoFile(w.thumbnail)){
    media.innerHTML = `<video src="${w.thumbnail}" controls playsinline></video>`;
  }else{
    media.innerHTML = `<img src="${w.thumbnail}" alt="${w.title}" onerror="this.remove()">`;
  }

  document.getElementById('workDetailTitle').textContent = w.title;
  const workBodyEl = document.getElementById('workDetailBody');
  // 「ひとこと説明」はmvのアーティスト名と同じスタイル(detail-artist)を再利用し、余白も揃える
  const workBodyHtml = w.detail ? renderMarkdown(w.detail) : '';
  workBodyEl.innerHTML = `<p class="detail-artist">${w.desc || ''}</p>${workBodyHtml}`;
  groupConsecutiveImages(workBodyEl);
  enableImageZoom(workBodyEl);
  enhanceYoutubeEmbeds(workBodyEl);
  enhanceTweetEmbeds(workBodyEl);
  updateBottomBackVisibility(!!(w.detail && w.detail.trim()), 'workDetailBackBottom');

  switchPanel('work-detail', true);
  setUrlPath(`/works/${id}`);
}

/* =====================================================
   左メニューのカテゴリ絞り込み（ORIGINAL・WORKS）
   category を省略した場合は、最後に見ていたカテゴリ（初回は先頭のカテゴリ）を表示します。
   これにより「original」を押すだけで、そのままカテゴリの中身が表示されます。
   ===================================================== */
const lastCategory = { original: 'mv', works: 'video' };

// category は "video" のような文字列でも、["video","music"]のような配列でもOK
function matchesCategory(item, cat){
  if(Array.isArray(item.category)) return item.category.includes(cat);
  return item.category === cat;
}

// カテゴリ一覧(サムネイル一覧)の中身だけを組み立てる処理。
// 画面の切り替え(switchPanel)やURLの更新は行わない。
// 詳細ページを直接開いた(リロードした)ときにも、裏側の一覧ページを
// 用意しておくためにこの関数を単独で呼び出せるようにしている。
function populateCategoryView(section, category){
  const cat = category || lastCategory[section];
  lastCategory[section] = cat;

  // メニュー内のカテゴリ項目のハイライトを更新（PC・スマホ両方まとめて）
  document.querySelectorAll(`.nav-pane__cat[data-section="${section}"]`).forEach(a => {
    a.classList.toggle('is-active', a.dataset.category === cat);
  });

  if(section === 'original'){
    const items = mvWorks.filter(w => matchesCategory(w, cat)).sort(byNewest);
    renderThumbList('originalCategoryGrid', items, 'original');
    document.getElementById('originalCategoryLabel').textContent = cat;
  }else{
    const items = otherWorks.filter(w => matchesCategory(w, cat)).sort(byNewest);
    renderThumbList('worksCategoryGrid', items, 'work');
    document.getElementById('worksCategoryLabel').textContent = cat;
  }
  return cat;
}

function openCategoryView(section, category){
  const cat = populateCategoryView(section, category);

  if(section === 'original'){
    switchPanel('original-category', true);
    setUrlPath(`/original/${cat}`);
  }else{
    switchPanel('works-category', true);
    setUrlPath(`/works/${cat}`);
  }
}

function setupCategoryNav(){
  // カテゴリ項目（mv / releases / design ... など）
  document.querySelectorAll('.nav-pane__cat').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      openCategoryView(a.dataset.section, a.dataset.category);
      closeMobileNav();
    });
  });

  // メニュータイトル本体（original / works）：押すと直前に見ていたカテゴリの中身が開く
  document.querySelectorAll('.nav-pane__link[data-section]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      openCategoryView(a.dataset.section, '');
      closeMobileNav();
    });
  });
}

/* =====================================================
   パネル切り替え（左メニュー・戻る → 右側の表示を瞬時に切り替え）
   左メニューは常に表示されたままで、右側の中身だけが切り替わります。
   ===================================================== */
const navListItems = document.querySelectorAll('#navList li');
const views = document.querySelectorAll('.view');
const viewPane = document.getElementById('viewPane');

// 動画(iframe)を差し込む可能性があるパネルと、そのメディア要素IDの対応表
const VIDEO_PANELS = {
  'view-original-detail': 'originalDetailMedia',
  'view-work-detail': 'workDetailMedia',
};

// 各パネルのスクロール位置を覚えておいて、戻ってきたときに続きから見られるようにする
const scrollPositions = {};

/* =====================================================
   URLで特定のページに直接リンクできるようにする仕組み
   ・ページを移動するたびにURLのパス部分を書き換える（見た目は変えず、履歴だけ追加）
   ・/mv/xxx のようなURLで直接アクセスされた時や、ブラウザの戻る/進むボタンでも正しいページを開く
   ===================================================== */
function setUrlPath(path){
  const target = (path.startsWith('/') ? path : '/' + path) + location.search;
  if(location.pathname + location.search !== target){
    history.pushState(null, '', target);
  }
}

function applyRouteFromPath(){
  const segments = location.pathname.split('/').filter(Boolean); // 例: "/original/mv-05" -> ["original","mv-05"]
  if(segments.length === 0){
    switchPanel('top', true);
    return;
  }
  const [first, second] = segments;
  const originalCategories = ['mv', 'releases', 'design', 'others'];
  const worksCategories = ['video', 'music', 'design', 'others'];

  if(second){
    // 2つめの区切りがある = カテゴリ一覧、または詳細ページ
    if(first === 'blog'){
      const post = blogPosts.find(p => p.id === second);
      if(post){ openBlogDetail(post); return; }
    }else if(first === 'original'){
      if(originalCategories.includes(second)){ openCategoryView('original', second); return; }
      if(mvWorks.find(x => x.id === second)){ openOriginalDetail(second); return; }
    }else if(first === 'works'){
      if(worksCategories.includes(second)){ openCategoryView('works', second); return; }
      if(otherWorks.find(x => x.id === second)){ openWorkDetail(second); return; }
    }
  }else{
    // 区切りが1つだけ = シンプルなページ
    if(first === 'blog'){ switchPanel('blog', true); return; }
    if(first === 'contact'){ switchPanel('contact', true); return; }
    if(first === 'listening'){ switchPanel('listening', true); return; }
    if(first === 'original'){ openCategoryView('original', ''); return; }
    if(first === 'works'){ openCategoryView('works', ''); return; }
  }
  // 該当するページが見つからない場合はTOPを表示する
  switchPanel('top', true);
}

window.addEventListener('popstate', applyRouteFromPath);

function switchPanel(panelName, forceTop){
  const currentActive = document.querySelector('.view.is-active');

  if(currentActive){
    // 離れるパネルのスクロール位置を保存
    // PCではviewPaneが、スマホでは画面(ウィンドウ)全体がスクロールするので、
    // 実際に動いている方の値を保存する
    const currentScroll = (viewPane ? viewPane.scrollTop : 0) || window.scrollY || 0;
    scrollPositions[currentActive.id] = currentScroll;

    // 動画を再生しているパネルから離れるときは、再生を止めるために中身を空にする
    if(VIDEO_PANELS[currentActive.id] && currentActive.id !== `view-${panelName}`){
      const media = document.getElementById(VIDEO_PANELS[currentActive.id]);
      if(media && media.querySelector('iframe')) media.innerHTML = '';
    }

    // LISTENINGページから離れるときも、再生中の動画があれば止めてサムネイルに戻す
    if(currentActive.id === 'view-listening' && currentActive.id !== `view-${panelName}`){
      if(currentActive.querySelector('iframe')) renderListening();
    }
  }

  const targetView = document.getElementById(`view-${panelName}`);
  views.forEach(v => v.classList.toggle('is-active', v === targetView));
  const navGroup = (targetView && targetView.dataset.navGroup) || panelName;
  navListItems.forEach(li => li.classList.toggle('is-active', li.dataset.panel === navGroup));

  // TOPを表示中かどうかをbodyに反映する（縦型スマホでのmenuボタン点滅に使う）
  // 「わたしを構成する音楽」ページもTOPの仲間として扱い、点滅を継続させる
  // 一度クラスを外してから強制的に再描画させ、戻るたびに必ず点滅が最初から再生されるようにする
  const menuLabel = document.querySelector('.mobile-bar__menu-label');
  const isTopFamily = panelName === 'top' || panelName === 'listening';
  document.body.classList.remove('is-viewing-top');
  if(isTopFamily){
    if(menuLabel) void menuLabel.offsetWidth; // 強制再描画（リフロー）
    document.body.classList.add('is-viewing-top');
  }

  // 「戻る」リンクのときだけ前回のスクロール位置を復元し、それ以外(メニューからの移動)は常に一番上から表示する
  // PC・スマホどちらでも正しい方に反映されるよう、両方に対して設定する
  const restoreScroll = forceTop ? 0 : ((targetView && scrollPositions[targetView.id]) || 0);
  if(viewPane) viewPane.scrollTop = restoreScroll;
  window.scrollTo(0, restoreScroll);

  // パネルが変わると中身の高さも変わるので、スクロールバーの表示・つまみの位置を更新する
  requestAnimationFrame(updateNavScrollbar);

  // 画面が切り替わったら、スマホのメニューは必ず閉じておく（閉じ忘れの保険）
  closeMobileNav();

  // シンプルなページ（項目IDを持たないもの）だけ、ここでURLを更新する
  // original-detail / work-detail / blog-detail は、それぞれの専用関数側でIDまで含めて更新する
  if(panelName === 'top') setUrlPath('/');
  else if(panelName === 'blog') setUrlPath('/blog');
  else if(panelName === 'contact') setUrlPath('/contact');
  else if(panelName === 'listening') setUrlPath('/listening');
}

document.querySelectorAll('a[data-panel]').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    // 「← back」のリンクだけは前回のスクロール位置を復元し、それ以外は常に一番上から表示する
    const isBackLink = el.classList.contains('view__back');
    switchPanel(el.dataset.panel, !isBackLink);
    closeMobileNav();
  });
});

/* =====================================================
   モバイルメニュー
   ===================================================== */
const menuToggle = document.getElementById('menuToggle');
let mobileNav;

function buildMobileNav(){
  mobileNav = document.createElement('nav');
  mobileNav.className = 'mobile-nav';
  mobileNav.innerHTML = `
    <a href="#" data-panel="top" class="nav-pane__link">top</a>
    <div class="mobile-nav__group">
      <a href="#" data-section="original" class="nav-pane__link">original</a>
      <div class="mobile-nav__cats">
        <a href="#" class="nav-pane__cat" data-section="original" data-category="mv">mv</a>
        <a href="#" class="nav-pane__cat" data-section="original" data-category="releases">releases</a>
        <a href="#" class="nav-pane__cat" data-section="original" data-category="design">design</a>
        <a href="#" class="nav-pane__cat" data-section="original" data-category="others">others</a>
      </div>
    </div>
    <div class="mobile-nav__group">
      <a href="#" data-section="works" class="nav-pane__link">works</a>
      <div class="mobile-nav__cats">
        <a href="#" class="nav-pane__cat" data-section="works" data-category="video">video</a>
        <a href="#" class="nav-pane__cat" data-section="works" data-category="music">music</a>
        <a href="#" class="nav-pane__cat" data-section="works" data-category="design">design</a>
        <a href="#" class="nav-pane__cat" data-section="works" data-category="others">others</a>
      </div>
    </div>
    <a href="#" data-panel="blog" class="nav-pane__link">blog</a>
    <a href="#" data-panel="contact" class="nav-pane__link">contact</a>
  `;
  document.body.appendChild(mobileNav);
  mobileNav.querySelectorAll('a[data-panel]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      switchPanel(a.dataset.panel, true);
      closeMobileNav();
    });
  });
  // original/worksとカテゴリ項目はsetupCategoryNav()側でまとめて登録されます
}

// ハンバーガーの3本線を直接取得しておく（CSSのクラスに頼らず、ここで見た目を確定させる）
const menuToggleSpans = menuToggle ? menuToggle.querySelectorAll('span') : [];

function setMenuIconState(isOpen){
  if(!menuToggleSpans.length) return;
  if(isOpen){
    menuToggleSpans[0].style.transform = 'translateY(7px) rotate(45deg)';
    menuToggleSpans[1].style.opacity = '0';
    menuToggleSpans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  }else{
    menuToggleSpans[0].style.transform = '';
    menuToggleSpans[1].style.opacity = '';
    menuToggleSpans[2].style.transform = '';
  }
}

function openMobileNav(){
  document.body.classList.add('nav-open');
  if(menuToggle) menuToggle.setAttribute('aria-expanded', 'true');
  setMenuIconState(true);
}
function closeMobileNav(){
  document.body.classList.remove('nav-open');
  if(menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
  setMenuIconState(false);
}
const mobileMenuTrigger = document.getElementById('mobileMenuTrigger');
if(mobileMenuTrigger){
  mobileMenuTrigger.addEventListener('click', () => {
    const isOpen = document.body.classList.contains('nav-open');
    isOpen ? closeMobileNav() : openMobileNav();
  });
}

/* =====================================================
   コンテンツデータの読み込み（data/mv.json, data/works.json）
   ・Decap CMSで編集したデータはこの2つのJSONファイルに保存されます
   ・読み込みが終わったら mv / otherWorks / mvWorks を組み直します
   ===================================================== */
async function loadContentData(){
  try{
    const [mvData, blogData, othersData, releasesData, designData, worksVideoData, worksMusicData, worksDesignData, worksOthersData] = await Promise.all([
      fetch('data/mv.json').then(res => res.json()),
      fetch('data/blog.json').then(res => res.json()),
      fetch('data/others.json').then(res => res.json()),
      fetch('data/releases.json').then(res => res.json()),
      fetch('data/design.json').then(res => res.json()),
      fetch('data/works-video.json').then(res => res.json()),
      fetch('data/works-music.json').then(res => res.json()),
      fetch('data/works-design.json').then(res => res.json()),
      fetch('data/works-others.json').then(res => res.json())
    ]);
    // 各JSONファイルは { "items": [...] } という形式になっています
    mv = mvData.items || [];
    blogPosts = blogData.items || [];
    originalOthers = othersData.items || [];
    releases = releasesData.items || [];
    originalDesign = designData.items || [];
    otherWorks = [
      ...(worksVideoData.items || []),
      ...(worksMusicData.items || []),
      ...(worksDesignData.items || []),
      ...(worksOthersData.items || [])
    ];
    mvWorks = [...mv, ...releases, ...originalDesign, ...originalOthers];
    renderBlog('blogList'); // ブログのデータが揃ってから一覧を描画する
    if(location.pathname !== '/' && location.pathname !== '') applyRouteFromPath(); // /mv/xxx のようなURLで直接アクセスされた場合、そのページを開く
  }catch(err){
    console.error('コンテンツデータの読み込みに失敗しました', err);
  }
}

/* =====================================================
   Markdown → HTML 変換
   ・Decap CMSのリッチテキストエディタは本文をMarkdown形式で保存します
   ・marked.js が読み込めている場合はそれを使い、太字・見出し・リンク・画像などを反映します
   ・読み込めなかった場合は改行だけ反映する簡易表示にフォールバックします
   ===================================================== */
/* =====================================================
   本文中の {large}...{/large} {small}...{/small} {pink}...{/pink}
   という書き方を、実際のスタイル(文字サイズ・ピンク色)に変換する
   ===================================================== */
function applyCustomFormatting(text){
  if(!text) return text;
  return text
    .replace(/\{large\}([\s\S]*?)\{\/large\}/g, '<span class="text-lg">$1</span>')
    .replace(/\{small\}([\s\S]*?)\{\/small\}/g, '<span class="text-sm">$1</span>')
    .replace(/\{pink\}([\s\S]*?)\{\/pink\}/g, '<span class="text-pink">$1</span>')
    .replace(/^\{br\}$/gm, '<div class="blank-line"></div>')
    .replace(/\{img src="([^"]*)"(?:\s+text="([^"]*)")?\}/g, (_, src, caption) => {
      const media = isVideoFile(src)
        ? `<video src="${src}" controls playsinline></video>`
        : `<img src="${src}" alt="">`;
      return `<div class="img-unit">${media}${caption ? `<span class="img-caption">${caption}</span>` : ''}</div>`;
    })
    .replace(/\{fullimg src="([^"]*)"(?:\s+text="([^"]*)")?\}/g, (_, src, caption) => {
      const media = isVideoFile(src)
        ? `<video src="${src}" controls playsinline></video>`
        : `<img src="${src}" alt="">`;
      return `<div class="img-full">${media}${caption ? `<span class="img-caption">${caption}</span>` : ''}</div>`;
    });
}

function renderMarkdown(text){
  if(!text) return '';
  const withCustomTags = applyCustomFormatting(text);
  if(window.marked && typeof window.marked.parse === 'function'){
    return window.marked.parse(withCustomTags);
  }
  const escaped = withCustomTags
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return `<p>${escaped.replace(/\n/g, '<br>')}</p>`;
}

/* =====================================================
   本文中の画像用ライトボックス（クリック/タップで拡大表示、ホイールでズーム）
   ・designカテゴリのライトボックスと違い、矢印(前へ/次へ)はありません
   ===================================================== */
function openBodyImageLightbox(src, alt){
  const lightbox = document.getElementById('bodyImageLightbox');
  const img = document.getElementById('bodyImageLightboxImg');
  if(!lightbox || !img) return;
  resetBodyLightboxZoom();
  img.src = src;
  img.alt = alt || '';
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
}

function closeBodyImageLightbox(){
  const lightbox = document.getElementById('bodyImageLightbox');
  if(!lightbox) return;
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  resetBodyLightboxZoom();
}

document.getElementById('bodyImageLightboxClose')?.addEventListener('click', closeBodyImageLightbox);
document.getElementById('bodyImageLightboxBackdrop')?.addEventListener('click', closeBodyImageLightbox);
document.addEventListener('keydown', (e) => {
  const lightbox = document.getElementById('bodyImageLightbox');
  if(!lightbox || !lightbox.classList.contains('is-open')) return;
  if(e.key === 'Escape') closeBodyImageLightbox();
});

const BODY_LIGHTBOX_MIN_ZOOM = 1;
const BODY_LIGHTBOX_MAX_ZOOM = 4;
const BODY_LIGHTBOX_ZOOM_STEP = 0.25;
let bodyLightboxZoomScale = 1;
let bodyLightboxPanX = 0;
let bodyLightboxPanY = 0;

function applyBodyLightboxTransform(){
  const img = document.getElementById('bodyImageLightboxImg');
  if(img) img.style.transform = `translate(${bodyLightboxPanX}px, ${bodyLightboxPanY}px) scale(${bodyLightboxZoomScale})`;
}

function resetBodyLightboxZoom(){
  bodyLightboxZoomScale = 1;
  bodyLightboxPanX = 0;
  bodyLightboxPanY = 0;
  applyBodyLightboxTransform();
  const wrap = document.getElementById('bodyImageLightboxImgWrap');
  if(wrap) wrap.style.cursor = 'zoom-in';
}

(function initBodyLightboxZoom(){
  const wrap = document.getElementById('bodyImageLightboxImgWrap');
  const img = document.getElementById('bodyImageLightboxImg');
  if(!wrap || !img) return;

  img.style.transformOrigin = 'center center';

  wrap.addEventListener('wheel', (e) => {
    e.preventDefault();
    bodyLightboxZoomScale += e.deltaY < 0 ? BODY_LIGHTBOX_ZOOM_STEP : -BODY_LIGHTBOX_ZOOM_STEP;
    bodyLightboxZoomScale = Math.max(BODY_LIGHTBOX_MIN_ZOOM, Math.min(BODY_LIGHTBOX_MAX_ZOOM, bodyLightboxZoomScale));
    if(bodyLightboxZoomScale <= BODY_LIGHTBOX_MIN_ZOOM){
      bodyLightboxPanX = 0;
      bodyLightboxPanY = 0;
    }
    applyBodyLightboxTransform();
    wrap.style.cursor = bodyLightboxZoomScale > BODY_LIGHTBOX_MIN_ZOOM ? 'grab' : 'zoom-in';
  }, { passive: false });

  let isDragging = false;
  let dragStartX = 0, dragStartY = 0;
  let panStartX = 0, panStartY = 0;

  wrap.addEventListener('mousedown', (e) => {
    if(bodyLightboxZoomScale <= BODY_LIGHTBOX_MIN_ZOOM) return;
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    panStartX = bodyLightboxPanX;
    panStartY = bodyLightboxPanY;
    wrap.style.cursor = 'grabbing';
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if(!isDragging) return;
    bodyLightboxPanX = panStartX + (e.clientX - dragStartX);
    bodyLightboxPanY = panStartY + (e.clientY - dragStartY);
    applyBodyLightboxTransform();
  });

  window.addEventListener('mouseup', () => {
    if(!isDragging) return;
    isDragging = false;
    wrap.style.cursor = bodyLightboxZoomScale > BODY_LIGHTBOX_MIN_ZOOM ? 'grab' : 'zoom-in';
  });
})();

// 本文中の画像すべてに、クリック/タップで拡大表示する機能を付ける
function enableImageZoom(container){
  if(!container) return;
  container.querySelectorAll('img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => openBodyImageLightbox(img.currentSrc || img.src, img.alt));
  });
}

/* =====================================================
   本文が書かれているときだけ、一番下にも「← back」を表示する
   ===================================================== */
function updateBottomBackVisibility(hasContent, backBtnId){
  const btn = document.getElementById(backBtnId);
  if(!btn) return;
  btn.style.display = hasContent ? 'inline-block' : 'none';
}

/* =====================================================
   本文中で連続して挿入された画像を、2枚ずつ横並びにする
   （画像だけの段落が連続しているときだけグループ化します）
   ===================================================== */
function groupConsecutiveImages(container){
  if(!container) return;
  const children = Array.from(container.children);
  let i = 0;
  const isSmallImageUnit = el => el && el.classList && el.classList.contains('img-unit');

  while(i < children.length){
    if(isSmallImageUnit(children[i])){
      const group = [children[i]];
      let j = i + 1;
      while(j < children.length && isSmallImageUnit(children[j])){
        group.push(children[j]);
        j++;
      }
      // 1枚だけのときも必ずグループ化して、常に「小」サイズで表示されるようにする
      const wrapper = document.createElement('div');
      wrapper.className = 'img-grid';
      group[0].parentNode.insertBefore(wrapper, group[0]);
      group.forEach(el => wrapper.appendChild(el));
      i = j;
    }else{
      i++;
    }
  }
}

/* =====================================================
   YouTubeの動画リンクを埋め込みプレーヤーに変換する
   ・本文中で、YouTubeの動画URLだけが単独で書かれている行が対象です
   ===================================================== */
function enhanceYoutubeEmbeds(container){
  if(!container) return;
  const ytPattern = /^https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=([\w-]{11})|youtu\.be\/([\w-]{11}))/i;
  const paragraphs = container.querySelectorAll('p');
  paragraphs.forEach(p => {
    const onlyChildLink = p.children.length === 1 && p.children[0].tagName === 'A' && p.textContent.trim() === p.children[0].textContent.trim();
    if(!onlyChildLink) return;
    const href = p.children[0].getAttribute('href') || '';
    const match = href.match(ytPattern);
    if(!match) return;
    const videoId = match[1] || match[2];
    const wrap = document.createElement('div');
    wrap.className = 'yt-embed';
    wrap.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}" title="YouTube video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    p.replaceWith(wrap);
  });
}

/* =====================================================
   X(旧Twitter)の埋め込み用スクリプトを、必要になった時だけ読み込む
   （投稿を1つも貼っていないページでは、余計な通信をしないようにするため）
   ===================================================== */
let twitterWidgetsLoadPromise = null;
function loadTwitterWidgetsScript(){
  if(window.twttr && window.twttr.widgets) return Promise.resolve();
  if(twitterWidgetsLoadPromise) return twitterWidgetsLoadPromise;
  twitterWidgetsLoadPromise = new Promise(resolve => {
    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
  return twitterWidgetsLoadPromise;
}

/* =====================================================
   X(旧Twitter)の投稿リンクを埋め込みカードに変換する
   ・本文中で、Xの投稿URLだけが単独で書かれている行が対象です
   ・（例: 文章の途中に貼ったリンクはそのままリンクとして表示されます）
   ===================================================== */
function enhanceTweetEmbeds(container){
  if(!container) return;
  const tweetUrlPattern = /^https?:\/\/(twitter\.com|x\.com)\/[^\/]+\/status\/\d+/i;
  const paragraphs = container.querySelectorAll('p');
  let foundTweet = false;
  paragraphs.forEach(p => {
    const onlyChildLink = p.children.length === 1 && p.children[0].tagName === 'A' && p.textContent.trim() === p.children[0].textContent.trim();
    if(!onlyChildLink) return;
    const href = p.children[0].getAttribute('href') || '';
    if(!tweetUrlPattern.test(href)) return;
    const blockquote = document.createElement('blockquote');
    blockquote.className = 'twitter-tweet';
    const a = document.createElement('a');
    a.href = href;
    blockquote.appendChild(a);
    p.replaceWith(blockquote);
    foundTweet = true;
  });
  if(foundTweet){
    loadTwitterWidgetsScript().then(() => {
      if(window.twttr && window.twttr.widgets && typeof window.twttr.widgets.load === 'function'){
        window.twttr.widgets.load(container);
      }
    });
  }
}

/* =====================================================
   初期化
   ===================================================== */
document.addEventListener('DOMContentLoaded', () => {
  loadContentData();
  renderListening();
  if(menuToggle) buildMobileNav();
  setupCategoryNav();
  initCursorTrail();
  initNavScrollbar();
});

/* =====================================================
   左メニュー右端のミニスクロールバー
   ・道（トラック）は透明のまま、正方形のつまみだけを表示する
   ・つまみをドラッグ（マウス・タッチ両対応）すると右側コンテンツがスクロールする
   ===================================================== */
let updateNavScrollbar = () => {};

function initNavScrollbar(){
  const track = document.getElementById('navScrollbar');
  const thumb = document.getElementById('navScrollbarThumb');
  const list = document.getElementById('navList');
  if(!track || !thumb || !viewPane || !list) return;

  // トラックの縦幅を「topの項目〜contactの項目」の実際の高さに合わせる
  function positionTrack(){
    const navPane = track.parentElement;
    const paneRect = navPane.getBoundingClientRect();
    const listRect = list.getBoundingClientRect();
    track.style.top = `${listRect.top - paneRect.top}px`;
    track.style.height = `${listRect.height}px`;
  }

  function update(){
    positionTrack();

    const activeView = document.querySelector('.view.is-active');
    const hiddenOn = ['view-top', 'view-contact'];
    const scrollable = viewPane.scrollHeight > viewPane.clientHeight + 2;
    const shouldShow = scrollable && !(activeView && hiddenOn.includes(activeView.id));

    track.classList.toggle('is-visible', shouldShow);
    if(!shouldShow) return;

    const maxTravel = track.clientHeight - thumb.offsetHeight;
    const progress = viewPane.scrollTop / (viewPane.scrollHeight - viewPane.clientHeight);
    thumb.style.transform = `translateY(${Math.max(0, Math.min(1, progress)) * maxTravel}px)`;
  }
  updateNavScrollbar = update;

  function scrollToPointer(clientY){
    const trackRect = track.getBoundingClientRect();
    const maxTravel = trackRect.height - thumb.offsetHeight;
    let y = clientY - trackRect.top - thumb.offsetHeight / 2;
    y = Math.max(0, Math.min(y, maxTravel));
    const progress = maxTravel > 0 ? y / maxTravel : 0;
    viewPane.scrollTop = progress * (viewPane.scrollHeight - viewPane.clientHeight);
  }

  let dragging = false;
  thumb.addEventListener('pointerdown', (e) => {
    dragging = true;
    thumb.setPointerCapture(e.pointerId); // 指がつまみの外に出ても追従し続けるようにする
    e.preventDefault();
  });
  thumb.addEventListener('pointermove', (e) => {
    if(!dragging) return;
    scrollToPointer(e.clientY);
  });
  thumb.addEventListener('pointerup', () => { dragging = false; });
  thumb.addEventListener('pointercancel', () => { dragging = false; });

  viewPane.addEventListener('scroll', update);
  window.addEventListener('resize', update);
  update();
}

/* =====================================================
   カーソル追従の線
   ・カーソルの軌跡に沿って、四角くつながる線を描く
   ・置かれてから1秒経った点から、古いものの方から1つずつ消えていく
   ===================================================== */
function initCursorTrail(){
  const canvas = document.getElementById('cursorTrail');
  if(!canvas) return;

  // 動きを抑えたい設定（OS側の「視差効果を減らす」等）では表示しない
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(prefersReduced) return;

  const ctx = canvas.getContext('2d');
  const LIFETIME = 1000;      // 点が消えるまでの時間(ms)
  const LINE_WIDTH = 6;       // ↓ここが線の太さです(px)。数字を変えるだけで調整できます
  const LINE_COLOR = '#F8ABA6';
  const MIN_DISTANCE = 12;    // 点を打つ間隔(px)

  let points = [];
  let lastX = null;
  let lastY = null;

  function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function addPoint(x, y){
    if(lastX === null){
      lastX = x;
      lastY = y;
    }
    const dx = x - lastX;
    const dy = y - lastY;
    if(Math.sqrt(dx * dx + dy * dy) >= MIN_DISTANCE){
      points.push({ x, y, t: performance.now() });
      lastX = x;
      lastY = y;
    }
  }

  // マウス操作（PC）
  window.addEventListener('mousemove', (e) => {
    addPoint(e.clientX, e.clientY);
  });

  // タッチ操作（スマホ・タブレット）：スワイプした軌跡にも同じ線を描く
  window.addEventListener('touchstart', () => {
    lastX = null;
    lastY = null;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    if(!touch) return;
    addPoint(touch.clientX, touch.clientY);
  }, { passive: true });

  function render(){
    const now = performance.now();

    // 1秒経った点を、古いものから1つずつ取り除く
    while(points.length && now - points[0].t > LIFETIME){
      points.shift();
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if(points.length > 1){
      ctx.strokeStyle = LINE_COLOR;
      ctx.lineWidth = LINE_WIDTH;
      ctx.lineCap = 'square';
      ctx.lineJoin = 'miter';
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for(let i = 1; i < points.length; i++){
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
    }

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}