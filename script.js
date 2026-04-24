let sonAramaSonuclari = []; // İnternetten gelen son listeyi burada tutacağız
let favorilerim = JSON.parse(localStorage.getItem("izlemeListem")) || []; // Çelik kasamız

document.getElementById("araButonu").addEventListener("click", async function() {
    let arananKelime = document.getElementById("aramaKutusu").value;

    // KULLANICI DENEYİMİ: Eğer kutu boşsa uyarı ver ve işlemi durdur (return)
    if (arananKelime === "") {
        document.getElementById("bilgiEkrani").innerText = "Lütfen aramak için bir film veya dizi adı yazın!";
        document.getElementById("bilgiEkrani").style.color = "#e50914"; // Kırmızı
        return; // return kullanma sebebi geçersiz durumda işlemi kesmek (early exit) 
                // Hatalı input varsa devam etmemek
                // Gereksiz işlem yapmamak
                // Kodun daha temiz ve güvenli çalışmasını sağlamak
    }

    // Yükleniyor mesajı
    document.getElementById("bilgiEkrani").innerText = "⏳ İnternette aranıyor, lütfen bekleyin...";
    document.getElementById("bilgiEkrani").style.color = "#b3b3b3"; // Gri
    document.getElementById("filmGrid").innerHTML = ""; // Eski kartları temizle

    try {
        let cevap = await fetch(`https://api.tvmaze.com/search/shows?q=${arananKelime}`);
        let veriler = await cevap.json();

        // 🌟 YENİ: Gelen verileri global dizimize kopyalıyoruz ki kaybolmasınlar
        sonAramaSonuclari = veriler;

        // KULLANICI DENEYİMİ: Eğer API'den boş liste (0 eleman) gelirse
        if(veriler.length === 0) {
            document.getElementById("bilgiEkrani").innerText = "❌ Üzgünüz, bu isimde bir yapım bulunamadı.";
            return;
        }

        // Başarı mesajı
        document.getElementById("bilgiEkrani").innerText = `✅ "${arananKelime}" için arama sonuçları:`;
        document.getElementById("bilgiEkrani").style.color = "white";

        // 🔥 İŞTE O SİHİRLİ BANT: Verileri alıp ŞIK KARTLARA dönüştürüyoruz!
        document.getElementById("filmGrid").innerHTML = veriler.map(item => {   
            
            // BAZI DİZİLERİN FOTOĞRAFI VEYA ÖZETİ OLMAYABİLİR! Hata vermemesi için kontrol ediyoruz:
            // "item.show.image var mı? (?) Varsa onu kullan, Yoksa (:) şu gri resmi kullan"
            let resim = item.show.image ? item.show.image.medium : "https://via.placeholder.com/210x295?text=Resim+Yok";
            let puan = item.show.rating.average || "N/A"; // N/A: Not Available (Bilinmiyor)
            
            // Özeti al, HTML etiketlerini temizlemek için çok detaya girmedik ama 100 karakterde kestik
            let ozet = item.show.summary ? item.show.summary.substring(0, 100) + "..." : "Bu yapım için özet bulunmamaktadır.";

            // Şık kart tasarımımız:
            return `
                <div class="movie-card">
                    <img src="${resim}" alt="${item.show.name}">
                    <div class="movie-info">
                        <h3>${item.show.name}</h3>
                        <span class="rating">⭐ ${puan}</span>
                        <p class="summary">${ozet}</p>

                        <button class="fav-btn" onclick="listeyeEkle(${item.show.id})">+ Listeme Ekle</button>
                    </div>
                </div>
            `;
        }).join(""); // Kartları arasına virgül koymadan birleştir

        // Arama yapıldıktan sonra kutuyu temizle
        document.getElementById("aramaKutusu").value = "";

    } catch (hata) {
        document.getElementById("bilgiEkrani").innerText = "❌ Eyvah! Sunucuya bağlanılamadı. İnternetinizi kontrol edin.";
        document.getElementById("bilgiEkrani").style.color = "#e50914";
        console.log("Hata detayı:", hata);
    }        
});

function listeyeEkle(filmID) {
    // 1. Tıklanan filmi 'sonAramaSonuclari' dizisinde bul
    let filmSirasi = sonAramaSonuclari.findIndex(item => item.show.id === filmID);
    let secilenFilm = sonAramaSonuclari[filmSirasi];

    // 2. Bu film zaten kasamızda var mı diye kontrol et (Aynı filmi 2 kere eklemeyelim)
    let favoriSirasi = favorilerim.findIndex(fav => fav.show.id === filmID);

    if (favoriSirasi === -1) { 
        // Kasada yoksa ekle!
        favorilerim.push(secilenFilm);
        localStorage.setItem("izlemeListem", JSON.stringify(favorilerim)); // Kasaya kilitle
        alert(secilenFilm.show.name + " başarıyla listene eklendi! 🍿");
    } else {
        // Kasada varsa uyarı ver
        alert("Bu film zaten listende var! 😎");
    }
}