export const metadata = { title: "Gizlilik", alternates: { canonical: "/privacy" } };
export default function Page() {
  return (
    <article className="container page-section legal-copy">
      <span className="eyebrow plain">GİZLİLİK</span>
      <h1 className="page-title" style={{ marginTop: 15 }}>
        Verilerin senin hikâyen.
      </h1>
      <p className="form-note" style={{ marginTop: 25 }}>
        Yayıma hazırlık taslağı — Bu metin hukuken onaylanmış değildir. Veri sorumlusunun unvanı,
        iletişim adresi, işleme şartları, hizmet sağlayıcılar ve yurt dışı aktarım değerlendirmesi
        işletmeci tarafından tamamlanmalı; KVKK ve hedef pazarlardaki gereklilikler açısından hukuk
        incelemesi yapılmalıdır.
      </p>
      <h2>Hangi bilgiler kaydedilir?</h2>
      <p>
        Hesap açtığında e-posta adresin, görünen adın, seçtiğin simge ve güvenli biçimde özetlenmiş
        şifren saklanır. Test çözerken yalnızca takma adın, seçtiğin cevaplar, katılım zamanların ve
        sonuçların kaydedilir. Tarayıcın, katılımına erişmeni sağlamak için rastgele bir oturum
        tanımlayıcısı kullanır.
      </p>
      <h2>Ne için kullanılır?</h2>
      <p>
        Bilgilerin hesap erişimi, test oluşturma, sunucuda puanlama, sıralama, kötüye kullanımın
        sınırlandırılması ve test sahibine istatistik sağlanması için kullanılır. Arkadaşının
        testini çözmek için hesap açman gerekmez. Gerçek adın yerine takma ad kullanabilirsin.
        Güvenlik sınırlandırmasında ham IP adresi yerine süreli anahtarlı özetler kullanılabilir.
      </p>
      <h2>Kimler görebilir?</h2>
      <p>
        Test sahibi takma adını ve puanını görebilir. Sıralama açıksa takma adın veya maskelenmiş
        biçimi, puanın ve tamamlama tarihin diğer katılımcılara görünür. E-posta adresin ve hesap
        bilgilerin herkese açık olarak gösterilmez. Sonuç detayına katıldığın tarayıcıdan veya test
        sahibi hesabından erişilir.
      </p>
      <h2>Çerezler ve tarayıcı depolaması</h2>
      <p>
        Giriş oturumu ve misafir katılımı için gerekli çerezler kullanılır. Yarım kalan cevaplar,
        devam edebilmen için aynı tarayıcıda yerel olarak saklanabilir. Reklam, parmak izi çıkarma
        veya üçüncü taraf analiz takipçileri varsayılan olarak bulunmaz.
      </p>
      <h2>Saklama ve silme</h2>
      <p>
        Katılım kayıtları varsayılan olarak 365 gün, tamamlanmamış katılımlar 7 gün saklanacak
        şekilde temizlik aracıyla yönetilir. İşletmeci bu aracı zamanlamalıdır. Süresi dolan
        sınırlandırma kayıtları silinir. Hesabını ayarlardan sildiğinde testlerin, sürümleri,
        katılımları ve oturumların ilişkisel olarak silinir. Altyapı yedekleri ve loglarının saklama
        süreleri işletmeci tarafından ayrıca tanımlanmalıdır.
      </p>
      <h2>Genç kullanıcılar</h2>
      <p>
        Gereksiz kişisel bilgi paylaşma. Okul, adres, telefon ve özel nitelikli bilgileri test
        başlıklarına, sorulara veya takma adına yazma. Yaşına ve yaşadığın yere uygun izin
        gereklilikleri için bir ebeveyn veya vasiden yardım al.
      </p>
      <h2>İletişim ve başvurular</h2>
      <p>
        Veri sorumlusunun iletişim ve başvuru kanalı yayımdan önce bu bölüme eklenmelidir. Bu alan
        tamamlanmadan bu metin nihai aydınlatma metni olarak kullanılmamalıdır.
      </p>
    </article>
  );
}
