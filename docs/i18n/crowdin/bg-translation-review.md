# Bulgarian Draft Translation Review

Review target: `docs/i18n/crowdin/dkapptools-site.bg.draft.json`

Scope: only strings that need attention are listed. The draft generally preserves protected names such as DK App Tools, Offline FileSecure, Google Play, Android, and PIN.

## Issues Found

### 1. `home.meta.description`

- English source: `DK App Tools is a compact software hub for practical apps, product pages, support, privacy information, and useful articles.`
- Current Bulgarian draft: `DK App Tools е компактно софтуерно място за практични приложения, продуктови страници, поддръжка, информация за поверителност и полезни статии.`
- Suggested improved Bulgarian: `DK App Tools е компактен софтуерен център за практични приложения, продуктови страници, поддръжка, информация за поверителност и полезни статии.`
- Reason: `софтуерно място` sounds literal and weak. `софтуерен център` is more natural for `hub`.

### 2. `home.hero.primaryCta`

- English source: `Explore apps`
- Current Bulgarian draft: `Виж приложенията`
- Suggested improved Bulgarian: `Разгледайте приложенията`
- Reason: `Виж` is understandable but casual. The site tone is premium/professional; `Разгледайте` is smoother.

### 3. `home.hero.secondaryCta`

- English source: `Read articles`
- Current Bulgarian draft: `Прочети статиите`
- Suggested improved Bulgarian: `Прочетете статиите`
- Reason: Keep CTA tone consistent with formal/professional address.

### 4. `home.featuredApp.viewApps`

- English source: `View apps`
- Current Bulgarian draft: `Виж приложенията`
- Suggested improved Bulgarian: `Разгледайте приложенията`
- Reason: Same CTA tone issue as `home.hero.primaryCta`.

### 5. `home.featuredApp.description`

- English source: `The first app from DK App Tools helps protect private files locally on Android, with clear product and privacy information alongside it.`
- Current Bulgarian draft: `Първото приложение от DK App Tools помага за локална защита на лични файлове на Android, с ясна продуктова информация и информация за поверителност.`
- Suggested improved Bulgarian: `Първото приложение от DK App Tools помага да защитавате лични файлове локално на Android, с ясна информация за продукта и поверителността.`
- Reason: Current text repeats `информация` and sounds slightly nominalized. Suggested version is more natural while preserving the claim.

### 6. `home.featuredApp.productCta`

- English source: `Open product page`
- Current Bulgarian draft: `Отвори продуктовата страница`
- Suggested improved Bulgarian: `Отворете продуктовата страница`
- Reason: Formal address should be consistent across public CTAs.

### 7. `home.brand.kicker`

- English source: `Brand home`
- Current Bulgarian draft: `Начало на марката`
- Suggested improved Bulgarian: `Дом на марката`
- Reason: `Начало на марката` sounds like a literal UI label. `Дом на марката` is closer to the intended brand-home idea.

### 8. `home.resources.title`

- English source: `Built around practical software`
- Current Bulgarian draft: `Създадено около практичен софтуер`
- Suggested improved Bulgarian: `Изградено около практичен софтуер`
- Reason: `Създадено около` is a literal calque. `Изградено около` is the natural Bulgarian phrasing.

### 9. `home.resources.description`

- English source: `A place for focused apps, clear product pages, useful articles, and support that grows with real products - not empty placeholders.`
- Current Bulgarian draft: `Място за фокусирани приложения, ясни продуктови страници, полезни статии и поддръжка, което расте с реални продукти - не с празни заместители.`
- Suggested improved Bulgarian: `Място за фокусирани приложения, ясни продуктови страници, полезни статии и поддръжка, което расте с реални продукти - не с празно съдържание.`
- Reason: `празни заместители` is literal and not idiomatic in this context.

### 10. `home.resources.noFakeScaleDescription`

- English source: `DK App Tools should grow with real apps, real articles, and real support pages - not filler cards.`
- Current Bulgarian draft: `DK App Tools трябва да расте с реални приложения, реални статии и реални страници за поддръжка - не с пълнеж.`
- Suggested improved Bulgarian: `DK App Tools трябва да расте с реални приложения, реални статии и реални страници за поддръжка - не със запълващо съдържание.`
- Reason: `пълнеж` is colloquial and less polished for public brand copy.

### 11. `apps.offlineFileSecureCard.description`

- English source: `A local Android file vault for protected copies of private files - built without accounts, cloud upload, ads, or tracking.`
- Current Bulgarian draft: `Локален файлов сейф за Android за защитени копия на лични файлове - създаден без акаунти, качване в облак, реклами или проследяване.`
- Suggested improved Bulgarian: `Локален файлов сейф за Android за защитени копия на лични файлове - създаден без акаунт, без качване в облак, без реклами и без проследяване.`
- Reason: Glossary requires `No account -> без акаунт`, singular. Repeating `без` also preserves the no-account/no-cloud/no-ads/no-tracking claim more clearly.

### 12. `apps.offlineFileSecureCard.vaultAccessDescription`

- English source: `Unlock with PIN. Use your recovery key only for local PIN reset.`
- Current Bulgarian draft: `Отключване с PIN. Използвайте ключа за възстановяване само за локално нулиране на PIN.`
- Suggested improved Bulgarian: `Отключвайте с PIN. Използвайте ключа за възстановяване само за локално нулиране на PIN.`
- Reason: The first sentence is a fragment. Suggested phrasing reads more naturally as product UI copy.

### 13. `offlineFileSecure.import.description`

- English source: `Adding to the vault creates a protected encrypted copy. The original file remains where it was unless you delete it yourself, and every import is started by you.`
- Current Bulgarian draft: `Добавянето към сейфа създава защитено криптирано копие. Оригиналният файл остава там, където е бил, освен ако сами не го изтриете, и всяко добавяне започва по ваш избор.`
- Suggested improved Bulgarian: `Добавянето към сейфа създава защитено криптирано копие. Оригиналният файл остава там, където е бил, освен ако сами не го изтриете, а всяко добавяне започва по ваш избор.`
- Reason: `и` after the parenthetical clause is grammatically heavier. `а` improves flow without changing meaning.

### 14. `offlineFileSecure.organization.title`

- English source: `Keep vault files understandable as they grow`
- Current Bulgarian draft: `Поддържайте файловете в сейфа разбираеми, докато се увеличават`
- Suggested improved Bulgarian: `Поддържайте файловете в сейфа лесни за ориентиране, докато се увеличават`
- Reason: `файловете ... разбираеми` is awkward; files are not usually `understandable` in Bulgarian. The intent is organization/readability.

### 15. `offlineFileSecure.organization.description`

- English source: `Files are stored inside the vault. Pro adds convenience and organization features such as a category dashboard, image thumbnail setting, recently added organization, and batch import.`
- Current Bulgarian draft: `Файловете се съхраняват в сейфа. Pro добавя удобства и функции за организация, като табло с категории, настройка за миниатюри на изображения, организация на наскоро добавени файлове и групово добавяне.`
- Suggested improved Bulgarian: `Файловете се съхраняват в сейфа. Pro добавя удобства и функции за организация, като табло с категории, настройка за миниатюри на изображения, инструменти за наскоро добавени файлове и групово добавяне.`
- Reason: `организация на наскоро добавени файлове` sounds mechanical. `инструменти за наскоро добавени файлове` is clearer and still accurate.

### 16. `offlineFileSecure.preview.description`

- English source: `Supported common file types can be previewed inside Offline FileSecure. The preview flow is designed to avoid making external apps the default path, without claiming every file type is supported.`
- Current Bulgarian draft: `Поддържани често срещани файлови типове могат да се преглеждат в Offline FileSecure. Потокът за преглед е проектиран така, че външните приложения да не са основният път, без да се твърди, че всеки файлов тип се поддържа.`
- Suggested improved Bulgarian: `Поддържани често срещани файлови типове могат да се преглеждат в Offline FileSecure. Процесът на преглед е проектиран така, че външните приложения да не са основният път, без да се твърди, че всеки файлов тип се поддържа.`
- Reason: `Потокът за преглед` is a literal technical calque. `Процесът на преглед` is more natural.

### 17. `offlineFileSecure.encryption.kicker`

- English source: `Encrypted by design`
- Current Bulgarian draft: `Криптиране по замисъл`
- Suggested improved Bulgarian: `Криптиране по дизайн`
- Reason: `по замисъл` sounds unnatural here. `по дизайн` is more idiomatic in product/security copy, while not exaggerating the claim.

### 18. `offlineFileSecure.encryption.description`

- English source: `Offline FileSecure does not simply hide files behind a PIN screen. When you add a file, the app creates a protected encrypted copy inside the app's private vault storage. Encryption and decryption happen on your device, and vault files are encrypted with authenticated encryption so the app can detect if protected data has been changed or corrupted.`
- Current Bulgarian draft: `Offline FileSecure не скрива файловете само зад екран с PIN. Когато добавите файл, приложението създава защитено криптирано копие в частното хранилище на сейфа в приложението. Криптирането и декриптирането се извършват на вашето устройство, а файловете в сейфа са криптирани с удостоверено криптиране, за да може приложението да открие дали защитените данни са били променени или повредени.`
- Suggested improved Bulgarian: `Offline FileSecure не скрива файловете само зад екран с PIN. Когато добавите файл, приложението създава защитено криптирано копие в частното хранилище на сейфа в приложението. Криптирането и декриптирането се извършват на вашето устройство, а файловете в сейфа използват удостоверено криптиране, за да може приложението да открие дали защитените данни са били променени или повредени.`
- Reason: `са криптирани с удостоверено криптиране` is repetitive. `използват удостоверено криптиране` is cleaner and preserves the claim.

### 19. `offlineFileSecure.controls.description`

- English source: `Offline FileSecure uses a vault PIN, optional biometric unlock, screen protection setting, auto-lock, and visible encryption details. The Vault PIN controls access to the app, while vault files themselves are stored encrypted.`
- Current Bulgarian draft: `Offline FileSecure използва PIN за сейфа, опционално биометрично отключване, настройка за защита на екрана, автоматично заключване и видима информация за криптирането. PIN за сейфа контролира достъпа до приложението, а самите файлове в сейфа се съхраняват криптирани.`
- Suggested improved Bulgarian: `Offline FileSecure използва PIN за сейфа, незадължително биометрично отключване, настройка за защита на екрана, автоматично заключване и видима информация за криптирането. PIN за сейфа контролира достъпа до приложението, а самите файлове в сейфа се съхраняват криптирани.`
- Reason: `опционално` is common but less polished/formal than `незадължително`.

### 20. `offlineFileSecure.export.title`

- English source: `Protected files leave the vault by explicit export`
- Current Bulgarian draft: `Защитените файлове напускат сейфа чрез изрично извеждане`
- Suggested improved Bulgarian: `Защитените файлове напускат сейфа само чрез изрично извеждане`
- Reason: Adding `само` better preserves the boundary claim from the surrounding English section without strengthening it beyond the source context.

### 21. `privacy.deviceAccess.authentication`

- English source: `PIN and recovery authentication material stored locally for verification, not as plain PIN or plain recovery key storage.`
- Current Bulgarian draft: `материали за удостоверяване на PIN и ключ за възстановяване, съхранявани локално за проверка, не като обикновен PIN или обикновен ключ за възстановяване.`
- Suggested improved Bulgarian: `материали за удостоверяване на PIN и ключ за възстановяване, съхранявани локално за проверка, а не като PIN или ключ за възстановяване в явен вид.`
- Reason: `обикновен PIN` is not precise enough for `plain`. `в явен вид` is more formal and accurate for privacy/security text.

### 22. `privacy.permissions.noScan`

- English source: `Offline FileSecure does not scan the whole device storage or build an inventory of files outside the vault. The app may query Android-provided storage statistics, such as available storage space, to show storage status and help check whether there is enough room for import, preview, export, or vault operations.`
- Current Bulgarian draft: `Offline FileSecure не сканира цялото хранилище на устройството и не създава опис на файловете извън сейфа. Приложението може да заявява предоставена от Android информация за хранилището, например налично свободно място, за да показва статус и да помага при проверка дали има достатъчно място за добавяне, преглед, извеждане или операции със сейфа.`
- Suggested improved Bulgarian: `Offline FileSecure не сканира цялото хранилище на устройството и не създава списък на файловете извън сейфа. Приложението може да заявява предоставени от Android данни за хранилището, например налично свободно място, за да показва статус и да помага при проверка дали има достатъчно място за добавяне, преглед, извеждане или операции със сейфа.`
- Reason: `опис на файловете` is understandable but stiff. `данни за хранилището` is more precise than `информация за хранилището` in this formal context.

### 23. `privacy.changes.description`

- English source: `This policy may be updated when Offline FileSecure changes, such as when visual, usability, productivity, security, or compatibility improvements are released.`
- Current Bulgarian draft: `Тази политика може да бъде актуализирана, когато Offline FileSecure се променя, например при визуални, функционални, продуктивни, защитни или съвместимостни подобрения.`
- Suggested improved Bulgarian: `Тази политика може да бъде актуализирана, когато Offline FileSecure се променя, например при визуални подобрения, подобрения в използваемостта, продуктивността, сигурността или съвместимостта.`
- Reason: `продуктивни подобрения` and `защитни подобрения` sound unnatural. The suggested version is formal and clearer.

### 24. `support.contact.description`

- English source: `For support, send an email with the app name, device details, and a short description of what happened.`
- Current Bulgarian draft: `За поддръжка изпратете имейл с името на приложението, данни за устройството и кратко описание на случилото се.`
- Suggested improved Bulgarian: `За поддръжка изпратете имейл с името на приложението, данни за устройството и кратко описание на това какво се е случило.`
- Reason: `случилото се` is acceptable but slightly stiff. Suggested wording sounds more natural for support instructions.

### 25. `support.currentSupport.productDescription`

- English source: `Support for the local encrypted file vault, including import/export behavior, supported previews, local vault actions, security settings, and Free/Pro feature questions.`
- Current Bulgarian draft: `Поддръжка за локалния криптиран файлов сейф, включително поведение при добавяне и извеждане, поддържани прегледи, локални действия със сейфа, настройки за сигурност и въпроси за функциите Free и Pro.`
- Suggested improved Bulgarian: `Поддръжка за локалния криптиран файлов сейф, включително действия при добавяне и извеждане, поддържани прегледи, локални действия със сейфа, настройки за сигурност и въпроси за функциите Free и Pro.`
- Reason: `поведение при добавяне и извеждане` sounds like a literal technical translation. `действия при...` is clearer for support coverage.
