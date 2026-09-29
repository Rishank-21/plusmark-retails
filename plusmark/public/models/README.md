# 3D Models (`public/models/`)

Yahan saare product ke 3D models rakhe jaate hain. Har file `.glb` format mein honi chahiye
(binary glTF, Draco-compressed recommended). Website inhe isi folder se load karti hai —
alag folder banane ki zaroorat nahi.

## Naya model add karne ke steps

1. **File ka naam = product ka slug** rakho, `.glb` extension ke saath.
   - Slug wahi hona chahiye jo `data/products.ts` mein us product ka hai.
   - Example: White Board ka slug `deluxe-standard-white-board` hai →
     file ka naam `deluxe-standard-white-board.glb`.
2. **File yahin (`public/models/`) daalo.**
3. **`data/visuals.ts` mein us slug ki entry honi chahiye.**
   - Agar entry pehle se hai (jaisa existing products ke liye hai), to kuch aur karne ki
     zaroorat nahi — website apne aap model dikhane lagegi.
   - Agar naya product hai jiski koi entry nahi, to `visuals.ts` mein entry add karo,
     ya `data/products.ts` mein us product par seedha `model: "/models/<slug>.glb"` set kar do.

## Naam se jुड़े niyam

- Sirf lowercase letters, numbers aur hyphen (`-`) use karo. Space ya capital letters nahi.
- File ka naam bilkul slug se match hona chahiye (case-sensitive), warna model load nahi hoga
  aur website product ki image (fallback) dikha degi.

## Aur baatein

- Bina 3D model wale products apne aap image par fall back kar jaate hain — kuch tootega nahi.
- File size chhota rakho (aदर्श ~1–5 MB). Bhaari models scroll/3D ko slow kar sakte hain.
  Compress karne ke liye [gltf-transform](https://gltf.report/) ya Draco use karo.
- Hero section mein model ka angle/size tune karne ke liye `data/featured.ts` mein
  us product ke `yaw` aur `fit` values badlo.
