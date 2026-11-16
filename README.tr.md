# Sosyal test platformu

Kişiye özel arkadaşlık testleri oluşturmak, paylaşmak ve sonuçlarını incelemek için geliştirilmiş bir **tam yığın portföy projesidir**. Arayüz Türkçedir; mobil düzenleri ve açık/koyu temayı destekler.

**Canlı hizmet sunulmamaktadır. Ekran görüntülerindeki hesap ve içerikler örnektir.**

[English README](README.md) · [Kurulum](docs/SETUP.md) · [Mimari](docs/ARCHITECTURE.md)

## Ne yapar?

Test sahibi sorularını yazar veya bir şablon seçer, doğru cevapları işaretler ve testini yayımlar. Arkadaşları hesap açmadan, takma adlarıyla katılır. Puanlar sunucuda hesaplanır; test sahibi sonuçları ve sıralamayı panelinden takip eder.

## Özellikler

- Hesap oluşturma, giriş/çıkış, profil ve hesap ayarları
- Beş adımlı test oluşturma sihirbazı ve etkileşimli önizleme
- Arkadaşlık, ilişki, aile ve eğlence kategorilerinde 15 şablon
- 5–30 soru, 2–6 seçenek ve her soruda tek doğru cevap
- Taslak kaydetme, yayımlama, çoğaltma, arşivleme ve silme
- Üyeliksiz katılım, ilerleme çubuğu ve sayfa yenileme sonrası devam etme
- Sunucuda doğrulama ve puanlama, sonuç incelemesi ve sıralama
- Bağlantı paylaşımı, WhatsApp/Telegram ve QR kodu
- Katılım istatistikleri, puan dağılımı ve soru bazlı analizler
- Görünürlük, sonuç paylaşımı ve takma ad maskeleme ayarları

E-posta doğrulama ve şifre sıfırlama entegrasyonları bulunmaktadır; gerçek gönderim için e-posta sağlayıcısı yapılandırılmalıdır.

## Teknik yaklaşım

**Next.js · React · TypeScript · Tailwind CSS · Better Auth · PostgreSQL · Prisma · Zod · Vitest · Playwright**

Yayımlanmış test sürümleri korunur; sonraki düzenlemeler eski sonuçları değiştirmez. Doğru cevaplar oyun ekranının veri yüküne dahil edilmez. Katılım gönderimleri işlemsel olarak kaydedilir ve yinelenen gönderimler sonuçları çoğaltmaz. Her korumalı işlemde kayıt sahibi kontrol edilir.

## Yerelde çalıştırma

Node.js 22.12+ ve npm gerekir.

```bash
npm ci
npm run db:local
```

Veritabanı terminalini açık bırakıp ikinci terminalde:

```bash
npm run db:migrate
npm run db:seed
npm run dev
```

`http://127.0.0.1:3000` adresini açıp kayıt sayfasından kendi hesabını oluşturabilirsin. Depoda hazır hesap şifresi veya kişisel veritabanı bulunmaz.

## Doğrulama

16 Kasım 2026 tarihli yerel kontrollerde **10 birim testi, 5 PostgreSQL entegrasyon testi ve 3 Playwright senaryosu** geçti. Lint, TypeScript ve üretim derlemesi başarılı oldu. GitHub Actions yapılandırması depoda bulunmaktadır; yerel sonuçlar bağımsız bir güvenlik denetimi veya canlı ortam doğrulaması değildir.

## Ekran görüntüleri

Görüntüler bu bölüme sonradan eklenecektir. Önerilen dosya adları ve Markdown örnekleri için [görsel ekleme rehberine](docs/screenshots/README.md) bakabilirsin.

## Proje kapsamı

Bu çalışma, portföyde teknik yaklaşımı ve kullanıcı deneyimini göstermek içindir. Ayrı bir yönetici rolü bulunmaz; test sahipleri kendi içeriklerini yönetir. E-posta gönderimi, canlı altyapı ve zamanlanmış bakım ayrıca yapılandırılmalıdır. Gizlilik ve kullanım koşulları sayfaları hukuki onay almış metinler değildir.

Proje için henüz genel bir açık kaynak lisansı seçilmemiştir. Üçüncü taraf bağımlılıkların kendi lisansları geçerlidir. Ayrıntılı kapsam için [durum belgesini](docs/STATUS.md) inceleyebilirsin.
