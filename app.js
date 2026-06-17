const SUPABASE_URL = 'https://lsievokkismxxaiezdlm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzaWV2b2traXNteHhhaWV6ZGxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MjY0NzgsImV4cCI6MjA5NzAwMjQ3OH0.TZ6_NlpDIrl6xDucsc8S4hqA23RQVWsVLrQRjtr6YmQ';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'nguyenmm2803';

let sb = null, currentVoucher = null, currentRating = 0, currentReviewService = '', deferredPrompt = null;

const PRICES = {
    'Mod Skill - 10.000đ':10000,'Mod Cá - 20.000đ':20000,'Mod Level - 10.000đ':10000,'Mod Item - 20.000đ':20000,
    'Mod Pet - 20.000đ':20000,'Mod Kim Cương - 30.000đ/1tr KC':30000,'Câu Cá Vạn Cân Full - Liên hệ':0,
    'Script Sniper Arena - 15.000đ':15000,'Bản Mod Tự Mod - 85.000đ':85000,'Câu Chung Theo Giờ - 20.000đ/giờ':20000
};

const VIP_TIERS = [
    {min:0,level:0,name:'NEW',discount:0,icon:'🆕'},
    {min:100000,level:1,name:'VIP 1',discount:5,icon:'🥉'},
    {min:500000,level:2,name:'VIP 2',discount:10,icon:'🥈'},
    {min:1000000,level:3,name:'VIP 3',discount:15,icon:'🥇'},
    {min:5000000,level:4,name:'VIP 4',discount:20,icon:'💎'}
];

function getVipInfo(t){for(let i=VIP_TIERS.length-1;i>=0;i--)if(t>=VIP_TIERS[i].min)return VIP_TIERS[i];return VIP_TIERS[0]}
function getUser(){try{return JSON.parse(localStorage.getItem('knox_user'))}catch{return null}}
function setUser(u){localStorage.setItem('knox_user',JSON.stringify(u))}
function clearUser(){localStorage.removeItem('knox_user')}
function fm(n){return new Intl.NumberFormat('vi-VN').format(n||0)+'đ'}
function getPrice(s){if(PRICES[s]!==undefined)return PRICES[s];const m=s.match(/(\d+(?:[,.]\d+)*)\s*đ/);return m?parseInt(m[1].replace(/[,.]/g,'')):0}
function genCode(p){return p+'-'+Date.now().toString().slice(-6)+Math.floor(Math.random()*1000)}

function initSupabase(){try{if(window.supabase){sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);return true}}catch(e){console.error(e)}return false}

// PWA
if('serviceWorker' in navigator){
    window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{})});
}
window.addEventListener('beforeinstallprompt',e=>{
    e.preventDefault();
    deferredPrompt=e;
    if(!localStorage.getItem('pwa_dismissed')){
        setTimeout(()=>document.getElementById('pwaBanner')?.classList.remove('hidden'),3000);
    }
});
function installPWA(){
    if(deferredPrompt){
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(()=>{deferredPrompt=null;dismissPWA()});
    }
}
function dismissPWA(){
    document.getElementById('pwaBanner')?.classList.add('hidden');
    localStorage.setItem('pwa_dismissed','1');
}

window.addEventListener('DOMContentLoaded',()=>{
    initSupabase();
    initParticles();
    initNavbar();
    initGravity();
    initCountUp();
    initRatingStars();
    checkAuth();
    if(sb){
        loadScripts();
        loadHotDeals();
        loadTopDeposit();
    }
    setTimeout(()=>document.getElementById('chatWidget')?.classList.remove('hidden'),2000);
});

function initParticles(){
    const c=document.getElementById('particles');if(!c)return;
    for(let i=0;i<30;i++){
        const p=document.createElement('div');
        p.className='particle';
        p.style.left=Math.random()*100+'%';
        p.style.animationDuration=(Math.random()*6+4)+'s';
        p.style.animationDelay=Math.random()*8+'s';
        c.appendChild(p);
    }
}
function initNavbar(){window.addEventListener('scroll',()=>{const n=document.getElementById('navbar');if(n)n.classList.toggle('scrolled',window.scrollY>50)})}
function toggleMenu(){document.getElementById('navLinks')?.classList.toggle('active')}
function closeMobileMenu(){document.getElementById('navLinks')?.classList.remove('active')}
function scrollToSection(id){
    const el=document.getElementById(id);
    if(el){const y=el.getBoundingClientRect().top+window.pageYOffset-80;window.scrollTo({top:y,behavior:'smooth'})}
    closeMobileMenu();
}
function initGravity(){
    if(!('IntersectionObserver' in window)){document.querySelectorAll('.gravity-item').forEach(i=>i.classList.add('visible'));return}
    const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.querySelectorAll('.gravity-item').forEach(i=>i.classList.add('visible'))}),{threshold:0.1});
    document.querySelectorAll('.gravity-container').forEach(c=>obs.observe(c));
}
function initCountUp(){
    if(!('IntersectionObserver' in window))return;
    const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.querySelectorAll('.stat-number').forEach(c=>animateCount(c,parseInt(c.getAttribute('data-count'))));obs.unobserve(e.target)}}),{threshold:0.5});
    const s=document.querySelector('.hero-stats');if(s)obs.observe(s);
}
function animateCount(el,target){let c=0,s=target/125;const t=setInterval(()=>{c+=s;if(c>=target){c=target;clearInterval(t)}el.textContent=Math.floor(c)},16)}
function initRatingStars(){
    document.querySelectorAll('#ratingStars i').forEach(s=>{
        s.onclick=()=>{currentRating=parseInt(s.getAttribute('data-rating'));document.querySelectorAll('#ratingStars i').forEach(x=>x.classList.toggle('active',parseInt(x.getAttribute('data-rating'))<=currentRating))};
    });
}

async function checkAuth(){
    const u=getUser();
    if(u){showUserBar(u.username);if(sb&&!u.isAdmin){await refreshUserInfo();await loadNotificationCount()}}
}

async function refreshUserInfo(){
    const u=getUser();if(!u||!sb||u.isAdmin)return;
    try{
        const{data}=await sb.from('users').select('*').eq('username',u.username).maybeSingle();
        if(data){
            if(data.is_locked){toast('Tài khoản đã bị khóa!','error');logout();return}
            const balEl=document.getElementById('userBalance');
            if(balEl){
                const oldBal=parseInt(balEl.textContent.replace(/\D/g,''))||0;
                balEl.textContent=fm(data.balance);
                if(oldBal!==data.balance&&oldBal>0&&data.balance>oldBal){
                    toast(`💰 Nhận thêm ${fm(data.balance-oldBal)}!`,'success');
                    addNotification('💰 Nhận tiền',`Bạn vừa nhận ${fm(data.balance-oldBal)}!`);
                }
            }
            const ts=document.getElementById('totalSpent');
            const td=document.getElementById('totalDeposited');
            if(ts)ts.textContent=fm(data.total_spent);
            if(td)td.textContent=fm(data.total_deposited);
            const vip=getVipInfo(data.total_deposited||0);
            const vipEl=document.getElementById('vipBadge');
            if(vipEl){vipEl.innerHTML=`${vip.icon} ${vip.name}`;vipEl.className=`nav-vip-badge nav-vip-${vip.level}`}
            const refEl=document.getElementById('myReferralCode');
            if(refEl)refEl.value=data.referral_code||'REF'+data.id;
        }
    }catch(e){console.error(e)}
}
setInterval(refreshUserInfo,10000);

async function logLogin(username,success){
    if(!sb)return;
    try{
        const browser=navigator.userAgent.includes('Chrome')?'Chrome':navigator.userAgent.includes('Firefox')?'Firefox':navigator.userAgent.includes('Safari')?'Safari':'Other';
        const device=/Mobile|Android|iPhone/.test(navigator.userAgent)?'Mobile':'Desktop';
        const ipResp=await fetch('https://api.ipify.org?format=json').catch(()=>null);
        const ip=ipResp?(await ipResp.json()).ip:'unknown';
        await sb.from('login_history').insert([{username,ip,device,browser,success}]);
        if(success)await sb.from('users').update({last_login:new Date().toISOString(),last_ip:ip,last_device:`${device} - ${browser}`}).eq('username',username);
    }catch(e){}
}

async function register(){
    if(!sb)return toast('Database chưa kết nối!','error');
    const username=document.getElementById('regUsername').value.trim();
    const email=document.getElementById('regEmail').value.trim();
    const zalo=document.getElementById('regZalo').value.trim();
    const password=document.getElementById('regPassword').value;
    const password2=document.getElementById('regPassword2').value;
    const referral=document.getElementById('regReferral').value.trim();

    if(!username||!email||!password)return toast('Điền đầy đủ!','error');
    if(username.length<3)return toast('Tên từ 3 ký tự!','error');
    if(password.length<6)return toast('Mật khẩu từ 6 ký tự!','error');
    if(password!==password2)return toast('Mật khẩu không khớp!','error');
    if(username===ADMIN_USERNAME)return toast('Tên không dùng được!','error');

    try{
        const{data:ex}=await sb.from('users').select('username').eq('username',username).maybeSingle();
        if(ex)return toast('Tên đã tồn tại!','error');
        const refCode='REF'+Date.now().toString().slice(-6);
        const ins={username,email,zalo,password,balance:0,total_spent:0,total_deposited:0,vip_level:0,referral_code:refCode};
        if(referral)ins.referred_by=referral;
        const{error}=await sb.from('users').insert([ins]);
        if(error)return toast('Lỗi: '+error.message,'error');
        toast('Đăng ký thành công!','success');
        closeModal('registerModal');openModal('loginModal');
    }catch(e){toast('Lỗi kết nối!','error')}
}

async function login(){
    const username=document.getElementById('loginUsername').value.trim();
    const password=document.getElementById('loginPassword').value;
    if(!username||!password)return toast('Điền đầy đủ!','error');

    if(username===ADMIN_USERNAME&&password===ADMIN_PASSWORD){
        setUser({username:'admin',isAdmin:true});
        toast('Đăng nhập Admin!','success');
        closeModal('loginModal');
        setTimeout(()=>window.location.href='admin.html',800);
        return;
    }
    if(!sb)return toast('Database chưa kết nối!','error');

    try{
        const{data:user,error}=await sb.from('users').select('*').eq('username',username).eq('password',password).maybeSingle();
        if(error)return toast('Lỗi: '+error.message,'error');
        if(!user){
            await logLogin(username,false);
            const{data:cu}=await sb.from('users').select('username').eq('username',username).maybeSingle();
            if(!cu)return toast('Tên không tồn tại!','error');
            return toast('Mật khẩu sai!','error');
        }
        if(user.is_locked)return toast('Tài khoản đã bị khóa!','error');
        setUser({username:user.username,isAdmin:false});
        await logLogin(username,true);
        toast('Đăng nhập thành công!','success');
        closeModal('loginModal');
        showUserBar(user.username);
        await refreshUserInfo();
    }catch(e){toast('Lỗi: '+e.message,'error')}
}

function logout(){
    clearUser();
    document.getElementById('navUserSection')?.classList.add('hidden');
    document.getElementById('btnNotifMobile')?.classList.add('hidden');
    const bl=document.getElementById('btnLogin');if(bl)bl.style.display='inline-flex';
    toast('Đã đăng xuất!','info');closeMobileMenu();
}

function showUserBar(username){
    document.getElementById('navUserSection')?.classList.remove('hidden');
    document.getElementById('btnNotifMobile')?.classList.remove('hidden');
    const du=document.getElementById('displayUsername');if(du)du.textContent=username;
    const bl=document.getElementById('btnLogin');if(bl)bl.style.display='none';
}

function forgotPassword(){
    alert('🔑 QUÊN MẬT KHẨU\n\nVui lòng liên hệ Admin qua Zalo/Telegram:\n📱 Zalo: 0564 721 862\n💬 Telegram: @ngonthe666\n\nCung cấp tên đăng nhập + email đã đăng ký để admin reset!');
}

async function loadScripts(){
    if(!sb)return;
    try{
        const{data:scripts}=await sb.from('scripts').select('*').eq('active',true).order('id');
        if(!scripts?.length)return;
        const grid=document.getElementById('scriptGrid');if(!grid)return;
        const select=document.getElementById('orderService');
        const grp=select?.querySelector('optgroup[label="💻 Script Roblox"]');
        if(grp)grp.innerHTML='';
        grid.innerHTML=scripts.map((s,i)=>`<div class="script-card gravity-item visible" style="--delay:${i}"><div class="script-card-header"><div class="script-icon">🎯</div><span class="script-game">${s.game}</span></div><h3>${s.name}</h3><p class="script-desc">Script chất lượng cao</p><div class="script-price">${s.price}</div><button class="btn-order" onclick="orderItem('Script ${s.name} - ${s.price}')"><i class="fas fa-shopping-cart"></i> Đặt mua</button></div>`).join('');
        scripts.forEach(s=>{
            const opt=document.createElement('option');
            opt.value=`Script ${s.name} - ${s.price}`;opt.textContent=`Script ${s.name} - ${s.price}`;
            if(grp)grp.appendChild(opt);
            const m=s.price.match(/(\d+(?:[,.]\d+)*)/);
            if(m)PRICES[`Script ${s.name} - ${s.price}`]=parseInt(m[1].replace(/[,.]/g,''));
        });
    }catch(e){}
}

async function loadHotDeals(){
    if(!sb)return;
    const grid=document.getElementById('hotDealsGrid');if(!grid)return;
    try{
        const{data}=await sb.from('hot_deals').select('*').eq('active',true).order('id',{ascending:false}).limit(6);
        if(!data?.length){grid.innerHTML='<p class="empty-state"><i class="fas fa-fire"></i> Chưa có deal nào</p>';return}
        grid.innerHTML=data.map(d=>{
            const newPrice=Math.floor(d.original_price*(100-d.discount_percent)/100);
            return `<div class="hot-deal-card"><div class="hot-deal-badge">-${d.discount_percent}%</div><h3>🔥 ${d.product_name}</h3><p>${d.description||'Khuyến mãi đặc biệt'}</p><div class="deal-price"><span class="deal-old">${fm(d.original_price)}</span><span class="deal-new">${fm(newPrice)}</span></div><button class="btn-order" onclick="orderItem('${d.product_name} - ${fm(newPrice)}')"><i class="fas fa-fire"></i> Mua ngay</button></div>`;
        }).join('');
    }catch(e){grid.innerHTML='<p class="empty-state">Lỗi tải</p>'}
}

async function loadTopDeposit(){
    if(!sb)return;
    const list=document.getElementById('topDepositList');if(!list)return;
    try{
        const now=new Date();
        const start=new Date(now.getFullYear(),now.getMonth(),1).toISOString();
        const{data:deps}=await sb.from('deposits').select('username,amount').eq('status','completed').gte('created_at',start);
        const map={};
        (deps||[]).forEach(d=>{map[d.username]=(map[d.username]||0)+d.amount});
        const sorted=Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,10);
        if(!sorted.length){list.innerHTML='<p class="empty-state"><i class="fas fa-trophy"></i> Chưa có ai nạp tháng này</p>';return}
        list.innerHTML=sorted.map(([u,a],i)=>{
            const rank=i+1;
            const cls=rank<=3?`top-${rank}`:'';
            const rcls=rank===1?'r1':rank===2?'r2':rank===3?'r3':'r-other';
            const icon=rank===1?'🥇':rank===2?'🥈':rank===3?'🥉':`#${rank}`;
            const masked=u.substring(0,3)+'***';
            return `<div class="top-deposit-item ${cls}"><div class="top-rank ${rcls}">${icon}</div><div class="top-info"><h4>${masked}</h4><p>Tháng ${now.getMonth()+1}/${now.getFullYear()}</p></div><div class="top-amount">${fm(a)}</div></div>`;
        }).join('');
    }catch(e){list.innerHTML='<p class="empty-state">Lỗi tải</p>'}
}

function orderItem(svc){
    const u=getUser();
    if(!u){toast('Vui lòng đăng nhập!','info');openModal('loginModal');return}
    const sel=document.getElementById('orderService');
    if(sel){
        let found=false;
        for(let i=0;i<sel.options.length;i++)if(sel.options[i].value===svc){sel.selectedIndex=i;found=true;break}
        if(!found){
            const opt=document.createElement('option');opt.value=svc;opt.textContent=svc;
            sel.appendChild(opt);sel.value=svc;
            const m=svc.match(/(\d+(?:[,.]\d+)*)\s*đ/);if(m)PRICES[svc]=parseInt(m[1].replace(/[,.]/g,''));
        }
    }
    updateOrderPrice();openModal('orderModal');
}

function updateOrderPrice(){
    const svc=document.getElementById('orderService')?.value;
    const el=document.getElementById('orderPriceDisplay');
    if(el&&svc){
        const price=getPrice(svc);
        if(price>0){
            let display=`Giá: <strong>${fm(price)}</strong>`;
            if(currentVoucher){
                const discount=Math.floor(price*currentVoucher.discount_percent/100);
                display+=`<br><small>Giảm: -${fm(discount)} = <strong>${fm(price-discount)}</strong></small>`;
            }
            el.innerHTML=display;el.style.display='block';
        }else{el.innerHTML='<em>Liên hệ</em>';el.style.display='block'}
    }
}

async function applyVoucher(){
    const code=document.getElementById('voucherCode').value.trim().toUpperCase();
    const status=document.getElementById('voucherStatus');
    if(!code){currentVoucher=null;status.textContent='';updateOrderPrice();return}
    try{
        const{data:v}=await sb.from('vouchers').select('*').eq('code',code).eq('active',true).maybeSingle();
        if(!v){status.textContent='❌ Mã không hợp lệ';status.className='error';currentVoucher=null}
        else if(v.used_count>=v.max_uses){status.textContent='❌ Mã hết lượt';status.className='error';currentVoucher=null}
        else{currentVoucher=v;status.innerHTML=`✅ Giảm ${v.discount_percent}%`;status.className='success'}
        updateOrderPrice();
    }catch(e){status.textContent='Lỗi';}
}

async function placeOrder(){
    const u=getUser();if(!u||!sb)return toast('Vui lòng đăng nhập!','error');
    const service=document.getElementById('orderService').value;
    const note=document.getElementById('orderNote').value.trim();
    let price=getPrice(service);
    const code=genCode('KNX');

    if(price===0){
        try{
            await sb.from('orders').insert([{order_code:code,username:u.username,service,payment:'Liên hệ',note,price:0,status:'pending'}]);
            toast(`Đặt đơn thành công! Mã: ${code}`,'success');
            closeModal('orderModal');
        }catch(e){toast('Lỗi!','error')}
        return;
    }
    if(currentVoucher)price=Math.floor(price*(100-currentVoucher.discount_percent)/100);

    try{
        const{data:userData}=await sb.from('users').select('balance, total_spent').eq('username',u.username).maybeSingle();
        if(!userData)return toast('Lỗi!','error');
        const balance=userData.balance||0;
        if(balance<price){
            toast(`Số dư không đủ! Cần ${fm(price)}, có ${fm(balance)}`,'error');
            setTimeout(()=>{closeModal('orderModal');openModal('depositModal')},1500);
            return;
        }
        await sb.from('users').update({balance:balance-price,total_spent:(userData.total_spent||0)+price}).eq('username',u.username);
        await sb.from('orders').insert([{order_code:code,username:u.username,service,payment:currentVoucher?`Số dư (${currentVoucher.code})`:'Số dư',note,price,status:'pending',progress:0}]);
        if(currentVoucher)await sb.from('vouchers').update({used_count:currentVoucher.used_count+1}).eq('code',currentVoucher.code);
        addNotification('🛒 Mua hàng',`Đặt mua "${service}" thành công! Đã trừ ${fm(price)}.`);
        toast(`✅ Đặt đơn thành công! Mã: ${code}`,'success');
        closeModal('orderModal');
        document.getElementById('orderNote').value='';
        document.getElementById('voucherCode').value='';
        currentVoucher=null;
        await refreshUserInfo();
    }catch(e){toast('Lỗi: '+e.message,'error')}
}

async function requestDeposit(){
    const u=getUser();if(!u||!sb)return toast('Vui lòng đăng nhập!','error');
    const amount=parseInt(document.getElementById('depositAmount').value);
    const method=document.getElementById('depositMethod').value;
    const note=document.getElementById('depositNote').value.trim();
    if(!amount||amount<10000)return toast('Tối thiểu 10.000đ!','error');
    if(amount>10000000)return toast('Tối đa 10.000.000đ!','error');
    const code=genCode('NAP');
    try{
        await sb.from('deposits').insert([{deposit_code:code,username:u.username,amount,method,note,status:'pending'}]);
        addNotification('💰 Yêu cầu nạp',`Yêu cầu nạp ${fm(amount)} đã gửi.`);
        toast(`✅ Đã gửi yêu cầu nạp ${fm(amount)}!`,'success');
        closeModal('depositModal');
        document.getElementById('depositAmount').value='';
        document.getElementById('depositNote').value='';
        setTimeout(()=>{
            alert(`📌 HƯỚNG DẪN\n\nMã: ${code}\nSố tiền: ${fm(amount)}\n\n💳 Vietcombank:\nSTK: 1064291846\nChủ TK: NGUYEN TRUNG NGUYEN\nNội dung: NAP666\n\nAdmin duyệt trong 5-15p.`);
            scrollToSection('home');
        },300);
    }catch(e){toast('Lỗi: '+e.message,'error')}
}

function openCardModal(){
    const u=getUser();if(!u){toast('Vui lòng đăng nhập!','info');openModal('loginModal');return}
    updateCardReceived();
    document.getElementById('cardAmount').onchange=updateCardReceived;
    openModal('cardModal');
}
function updateCardReceived(){
    const amount=parseInt(document.getElementById('cardAmount').value)||0;
    const received=Math.floor(amount*0.7);
    const el=document.getElementById('cardReceived');
    if(el)el.textContent=fm(received);
}
async function submitCard(){
    const u=getUser();if(!u||!sb)return toast('Vui lòng đăng nhập!','error');
    const telco=document.getElementById('cardTelco').value;
    const amount=parseInt(document.getElementById('cardAmount').value);
    const serial=document.getElementById('cardSerial').value.trim();
    const code=document.getElementById('cardCode').value.trim();
    if(!serial||!code)return toast('Điền seri và mã thẻ!','error');
    if(serial.length<10||code.length<10)return toast('Seri/Mã không hợp lệ!','error');
    const cardCode=genCode('CARD');
    try{
        await sb.from('card_deposits').insert([{card_code:cardCode,username:u.username,telco,serial,code,amount,actual_amount:Math.floor(amount*0.7),status:'pending'}]);
        addNotification('💳 Nạp thẻ cào',`Yêu cầu nạp thẻ ${telco} ${fm(amount)} đã gửi.`);
        toast(`✅ Đã gửi thẻ! Mã: ${cardCode}`,'success');
        closeModal('cardModal');
        document.getElementById('cardSerial').value='';
        document.getElementById('cardCode').value='';
    }catch(e){toast('Lỗi: '+e.message,'error')}
}

async function loadHistory(){
    const u=getUser();if(!u||!sb)return;
    const c=document.getElementById('orderHistory');
    c.innerHTML='<p class="empty-state"><i class="fas fa-spinner fa-spin"></i> Đang tải...</p>';
    try{
        const[{data:orders},{data:deposits},{data:cards}]=await Promise.all([
            sb.from('orders').select('*').eq('username',u.username).order('created_at',{ascending:false}),
            sb.from('deposits').select('*').eq('username',u.username).order('created_at',{ascending:false}),
            sb.from('card_deposits').select('*').eq('username',u.username).order('created_at',{ascending:false})
        ]);
        const sm={'pending':{l:'Chờ',c:'pending'},'processing':{l:'Đang xử lý',c:'processing'},'completed':{l:'Hoàn thành',c:'completed'},'cancelled':{l:'Đã hủy',c:'cancelled'}};
        let html='';
        if(deposits?.length){
            html+='<h3>💰 Nạp tiền</h3>';
            html+=deposits.map(d=>{const s=sm[d.status]||sm.pending;return `<div class="order-item"><div class="order-item-header"><span class="order-id">${d.deposit_code}</span><span class="order-status ${s.c}">${s.l}</span></div><p><strong>Số tiền:</strong> ${fm(d.amount)}</p><p><strong>PT:</strong> ${d.method}</p><p><strong>Thời gian:</strong> ${new Date(d.created_at).toLocaleString('vi-VN')}</p></div>`}).join('');
        }
        if(cards?.length){
            html+='<h3 style="margin-top:20px">💳 Thẻ cào</h3>';
            html+=cards.map(d=>{const s=sm[d.status]||sm.pending;return `<div class="order-item"><div class="order-item-header"><span class="order-id">${d.card_code}</span><span class="order-status ${s.c}">${s.l}</span></div><p><strong>${d.telco}</strong> - ${fm(d.amount)}</p><p><strong>Nhận:</strong> ${fm(d.actual_amount)}</p><p>${new Date(d.created_at).toLocaleString('vi-VN')}</p></div>`}).join('');
        }
        if(orders?.length){
            html+='<h3 style="margin-top:20px">🛒 Đơn hàng</h3>';
            html+=orders.map(o=>{
                const s=sm[o.status]||sm.pending;
                let actions='';
                if(o.status==='pending')actions+=`<button class="btn-mini danger" onclick="cancelOrder('${o.order_code}',${o.price})"><i class="fas fa-times"></i> Hủy đơn</button>`;
                if(o.status==='completed'){
                    if(o.download_link)actions+=`<a href="${o.download_link}" target="_blank" class="btn-mini success"><i class="fas fa-download"></i> Tải xuống</a>`;
                    if(!o.rating)actions+=`<button class="btn-mini" onclick="openReviewOrder('${o.order_code}','${o.service}')"><i class="fas fa-star"></i> Đánh giá</button>`;
                }
                const progress=o.progress||0;
                return `<div class="order-item"><div class="order-item-header"><span class="order-id">${o.order_code}</span><span class="order-status ${s.c}">${s.l}</span></div><p><strong>Dịch vụ:</strong> ${o.service}</p>${o.price>0?`<p><strong>Giá:</strong> ${fm(o.price)}</p>`:''}${o.note?`<p><strong>Ghi chú:</strong> ${o.note}</p>`:''}<p><strong>Thời gian:</strong> ${new Date(o.created_at).toLocaleString('vi-VN')}</p>${o.status==='processing'||o.status==='pending'?`<div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div><p style="font-size:0.75rem;text-align:right">Tiến độ: ${progress}%</p>`:''}${actions?`<div class="order-actions">${actions}</div>`:''}</div>`;
            }).join('');
        }
        if(!html)html='<p class="empty-state"><i class="fas fa-inbox"></i> Chưa có giao dịch</p>';
        c.innerHTML=html;
    }catch(e){c.innerHTML='<p class="empty-state">Lỗi tải</p>'}
}

async function cancelOrder(code,price){
    if(!confirm(`Hủy đơn ${code}? Tiền sẽ được hoàn vào ví.`))return;
    const u=getUser();if(!u||!sb)return;
    try{
        const{data:user}=await sb.from('users').select('balance').eq('username',u.username).maybeSingle();
        await sb.from('users').update({balance:(user.balance||0)+price}).eq('username',u.username);
        await sb.from('orders').update({status:'cancelled'}).eq('order_code',code);
        addNotification('❌ Hủy đơn',`Đã hủy đơn ${code} và hoàn ${fm(price)} vào ví.`);
        toast(`✅ Đã hủy & hoàn ${fm(price)}!`,'success');
        await refreshUserInfo();
        loadHistory();
    }catch(e){toast('Lỗi: '+e.message,'error')}
}

function openReviewOrder(orderCode,service){
    currentReviewService=service;
    currentRating=0;
    document.getElementById('reviewService').textContent=service;
    document.getElementById('reviewComment').value='';
    document.querySelectorAll('#ratingStars i').forEach(s=>s.classList.remove('active'));
    window._reviewOrderCode=orderCode;
    closeModal('historyModal');
    openModal('reviewModal');
}

async function loadDashboard(){
    const u=getUser();if(!u||!sb)return;
    const c=document.getElementById('dashboardContent');
    c.innerHTML='<div class="skeleton skeleton-card"></div><div class="skeleton skeleton-card"></div>';
    try{
        const[{data:user},{data:orders}]=await Promise.all([
            sb.from('users').select('*').eq('username',u.username).maybeSingle(),
            sb.from('orders').select('*').eq('username',u.username)
        ]);
        const totalOrders=orders?.length||0;
        const completed=orders?.filter(o=>o.status==='completed').length||0;
        const vip=getVipInfo(user?.total_deposited||0);
        const nextVip=VIP_TIERS.find(v=>v.min>(user?.total_deposited||0));
        const remaining=nextVip?nextVip.min-(user?.total_deposited||0):0;
        c.innerHTML=`<div class="dashboard-stats"><div class="dash-stat"><div class="dash-stat-icon">💰</div><div class="dash-stat-value">${fm(user?.balance||0)}</div><div class="dash-stat-label">Số dư</div></div><div class="dash-stat"><div class="dash-stat-icon">📈</div><div class="dash-stat-value">${fm(user?.total_deposited||0)}</div><div class="dash-stat-label">Tổng nạp</div></div><div class="dash-stat"><div class="dash-stat-icon">🛒</div><div class="dash-stat-value">${fm(user?.total_spent||0)}</div><div class="dash-stat-label">Tổng chi</div></div><div class="dash-stat"><div class="dash-stat-icon">📦</div><div class="dash-stat-value">${totalOrders}</div><div class="dash-stat-label">Đơn hàng</div></div><div class="dash-stat"><div class="dash-stat-icon">✅</div><div class="dash-stat-value">${completed}</div><div class="dash-stat-label">Hoàn thành</div></div><div class="dash-stat"><div class="dash-stat-icon">${vip.icon}</div><div class="dash-stat-value" style="font-size:1.1rem">${vip.name}</div><div class="dash-stat-label">VIP</div></div></div>${nextVip?`<div style="background:rgba(139,92,246,0.1);border:1px solid var(--primary);padding:15px;border-radius:var(--radius-sm);margin-top:15px;text-align:center"><p style="color:var(--accent);font-weight:600">🎯 Nạp thêm ${fm(remaining)} để lên ${nextVip.name}</p></div>`:`<div style="background:rgba(245,158,11,0.1);border:1px solid #f59e0b;padding:15px;border-radius:var(--radius-sm);margin-top:15px;text-align:center"><p style="color:#f59e0b;font-weight:600">🏆 VIP cao nhất!</p></div>`}<div style="margin-top:15px;background:rgba(34,197,94,0.05);border:1px solid rgba(34,197,94,0.3);padding:12px;border-radius:var(--radius-sm)"><p style="color:#22c55e"><i class="fas fa-tag"></i> Ưu đãi: <strong>Giảm ${vip.discount}%</strong></p></div>`;
    }catch(e){c.innerHTML='<p class="empty-state">Lỗi</p>'}
}

async function loadNotifications(){
    const u=getUser();if(!u||!sb)return;
    const c=document.getElementById('notificationContent');
    c.innerHTML='<p class="empty-state"><i class="fas fa-spinner fa-spin"></i> Đang tải...</p>';
    try{
        const{data}=await sb.from('notifications').select('*').eq('username',u.username).order('created_at',{ascending:false}).limit(50);
        if(!data?.length){c.innerHTML='<p class="empty-state"><i class="fas fa-bell-slash"></i> Chưa có thông báo</p>';return}
        c.innerHTML=data.map(n=>`<div class="notif-item ${n.read?'':'unread'}"><div class="notif-icon"><i class="fas fa-bell"></i></div><div class="notif-content"><h4>${n.title}</h4><p>${n.message||''}</p><small>${new Date(n.created_at).toLocaleString('vi-VN')}</small></div></div>`).join('');
        await sb.from('notifications').update({read:true}).eq('username',u.username).eq('read',false);
        await loadNotificationCount();
    }catch(e){c.innerHTML='<p class="empty-state">Lỗi</p>'}
}

async function loadNotificationCount(){
    const u=getUser();if(!u||!sb)return;
    try{
        const{data}=await sb.from('notifications').select('id').eq('username',u.username).eq('read',false);
        const count=data?.length||0;
        const b1=document.getElementById('notifBadge');
        const b2=document.getElementById('notifBadgeMobile');
        if(count>0){if(b1){b1.textContent=count;b1.classList.remove('hidden')}if(b2){b2.textContent=count;b2.classList.remove('hidden')}}
        else{if(b1)b1.classList.add('hidden');if(b2)b2.classList.add('hidden')}
    }catch(e){}
}

async function addNotification(title,message){
    const u=getUser();if(!u||!sb||u.isAdmin)return;
    try{await sb.from('notifications').insert([{username:u.username,title,message,type:'info'}]);await loadNotificationCount()}catch(e){}
}

async function changePassword(){
    const u=getUser();if(!u||!sb)return toast('Vui lòng đăng nhập!','error');
    const old=document.getElementById('oldPass').value;
    const newP=document.getElementById('newPass').value;
    const newP2=document.getElementById('newPass2').value;
    if(!old||!newP||!newP2)return toast('Điền đầy đủ!','error');
    if(newP.length<6)return toast('Mật khẩu từ 6 ký tự!','error');
    if(newP!==newP2)return toast('Không khớp!','error');
    try{
        const{data:user}=await sb.from('users').select('password').eq('username',u.username).maybeSingle();
        if(!user||user.password!==old)return toast('Mật khẩu cũ sai!','error');
        await sb.from('users').update({password:newP}).eq('username',u.username);
        toast('✅ Đổi mật khẩu thành công!','success');
        addNotification('🔐 Đổi mật khẩu','Bạn vừa đổi mật khẩu');
        closeModal('changePassModal');
        document.getElementById('oldPass').value='';
        document.getElementById('newPass').value='';
        document.getElementById('newPass2').value='';
    }catch(e){toast('Lỗi: '+e.message,'error')}
}

function openReview(service){
    const u=getUser();if(!u){toast('Vui lòng đăng nhập!','info');openModal('loginModal');return}
    currentReviewService=service;currentRating=0;
    document.getElementById('reviewService').textContent=service;
    document.getElementById('reviewComment').value='';
    document.querySelectorAll('#ratingStars i').forEach(s=>s.classList.remove('active'));
    window._reviewOrderCode=null;
    openModal('reviewModal');
}

async function submitReview(){
    const u=getUser();if(!u||!sb)return toast('Vui lòng đăng nhập!','error');
    if(currentRating===0)return toast('Chọn số sao!','error');
    const comment=document.getElementById('reviewComment').value.trim();
    if(!comment)return toast('Nhập bình luận!','error');
    try{
        await sb.from('reviews').insert([{username:u.username,service:currentReviewService,rating:currentRating,comment}]);
        if(window._reviewOrderCode){
            await sb.from('orders').update({rating:currentRating}).eq('order_code',window._reviewOrderCode);
            window._reviewOrderCode=null;
        }
        toast('✅ Đã gửi đánh giá!','success');
        closeModal('reviewModal');
    }catch(e){toast('Lỗi: '+e.message,'error')}
}

function showTicketTab(tab,btn){
    document.querySelectorAll('.ticket-tab').forEach(t=>t.classList.remove('active'));
    document.querySelectorAll('.ticket-content').forEach(t=>t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('ticket'+(tab==='list'?'List':'New')).classList.add('active');
    if(tab==='list')loadTickets();
}

async function loadTickets(){
    const u=getUser();if(!u||!sb)return;
    const c=document.getElementById('ticketList');
    c.innerHTML='<p class="empty-state"><i class="fas fa-spinner fa-spin"></i> Đang tải...</p>';
    try{
        const{data}=await sb.from('tickets').select('*').eq('username',u.username).order('created_at',{ascending:false});
        if(!data?.length){c.innerHTML='<p class="empty-state"><i class="fas fa-inbox"></i> Chưa có yêu cầu</p>';return}
        c.innerHTML=data.map(t=>{
            const sBadge=t.status==='open'?'<span class="order-status pending">Chờ phản hồi</span>':t.status==='answered'?'<span class="order-status completed">Đã trả lời</span>':'<span class="order-status cancelled">Đóng</span>';
            return `<div class="ticket-item"><h4>${t.subject} ${sBadge}</h4><div class="ticket-meta">${t.ticket_code} • ${new Date(t.created_at).toLocaleString('vi-VN')}</div><div class="ticket-msg">${t.message}</div>${t.admin_reply?`<div class="ticket-reply"><b>👨‍💼 Admin trả lời:</b><p>${t.admin_reply}</p></div>`:''}</div>`;
        }).join('');
    }catch(e){c.innerHTML='<p class="empty-state">Lỗi</p>'}
}

async function submitTicket(){
    const u=getUser();if(!u||!sb)return toast('Vui lòng đăng nhập!','error');
    const subject=document.getElementById('ticketSubject').value.trim();
    const message=document.getElementById('ticketMessage').value.trim();
    if(!subject||!message)return toast('Điền đầy đủ!','error');
    const code=genCode('TKT');
    try{
        await sb.from('tickets').insert([{ticket_code:code,username:u.username,subject,message,status:'open'}]);
        addNotification('🎫 Yêu cầu hỗ trợ',`Đã gửi yêu cầu "${subject}". Admin sẽ phản hồi sớm.`);
        toast(`✅ Đã gửi yêu cầu! Mã: ${code}`,'success');
        document.getElementById('ticketSubject').value='';
        document.getElementById('ticketMessage').value='';
        document.querySelectorAll('.ticket-tab')[0].click();
    }catch(e){toast('Lỗi: '+e.message,'error')}
}

function copyReferral(){copyText(document.getElementById('myReferralCode').value)}
function toggleChat(){document.getElementById('chatBox')?.classList.toggle('hidden')}

function openModal(id){
    const m=document.getElementById(id);
    if(m){
        m.classList.add('active');
        document.body.style.overflow='hidden';
        if(id==='historyModal')loadHistory();
        if(id==='orderModal')updateOrderPrice();
        if(id==='dashboardModal')loadDashboard();
        if(id==='notificationModal')loadNotifications();
        if(id==='referralModal')refreshUserInfo();
        if(id==='ticketModal')loadTickets();
    }
    closeMobileMenu();
}
function closeModal(id){
    const m=document.getElementById(id);
    if(m){m.classList.remove('active');document.body.style.overflow=''}
}
function switchModal(f,t){closeModal(f);setTimeout(()=>openModal(t),200)}
document.addEventListener('click',e=>{if(e.target.classList.contains('modal')){e.target.classList.remove('active');document.body.style.overflow=''}});

function toast(msg,type='info'){
    const t=document.getElementById('toast');if(!t)return;
    t.textContent=msg;t.className=`toast ${type} show`;
    setTimeout(()=>t.classList.remove('show'),3500);
}
function copyText(text){
    if(navigator.clipboard)navigator.clipboard.writeText(text).then(()=>toast('Đã copy: '+text,'success'));
    else{const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);toast('Đã copy: '+text,'success')}
                                                                           }
