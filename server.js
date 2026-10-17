/**
 * Cimon Downloader — demo backend
 * License / attribution: Website is demo by ReyzaDev.
 *
 * This backend only calls the installed @coflyn/scrapr integration. Third-party
 * platform availability is not guaranteed; do not use it to bypass access controls.
 */
const express = require("express");
const path = require("path");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;

app.disable("x-powered-by");
app.use(express.json({ limit: "20kb" }));
app.use(express.static(ROOT, { index: false, dotfiles: "ignore", extensions: ["html"] }));

app.use("/api/", rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { ok: false, message: "Terlalu banyak permintaan. Coba lagi sebentar." }
}));

const BLOCKED_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0"]);
function validateUrl(value) {
  if (typeof value !== "string" || value.length > 2048) return null;
  try {
    const parsed = new URL(value);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    const host = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "");
    if (BLOCKED_HOSTS.has(host) || !host.includes(".")) return null;
    if (parsed.username || parsed.password) return null;
    return parsed;
  } catch { return null; }
}
function findMethod(mod, names) {
  for (const name of names) if (typeof mod?.[name] === "function") return { name, fn: mod[name] };
  return null;
}
function chooseMethod(scrapr, host, tool) {
  if (tool === "bypass") return findMethod(scrapr.resolver, ["unshorten", "unshort", "resolve"]);
  if (tool === "tiktok" || host.includes("tiktok")) {
    return findMethod(scapr.tiktok, ["snaptik", "tikwm", "musicaldown", "tiktok", "download"]);
  }
  if (tool === "instagram" || host.includes("instagram")) {
    return findMethod(scapr.instagram, ["fastdl", "snapinsta", "instagram", "download"]);
  }
  if (host.includes("youtube") || host === "youtu.be") {
    return findMethod(scapr.youtube, ["youtube", "video", "download"]);
  }
  if (host.includes("facebook") || host === "fb.watch") {
    return findMethod(scapr.facebook, ["fdown", "facebook", "download"]);
  }
  if (host.includes("twitter") || host.includes("x.com")) {
    return findMethod(scapr.twitter || scrapr.x, ["twitter", "twdown", "download"]);
  }
  if (host.includes("soundcloud")) return findMethod(scapr.soundcloud, ["soundcloud", "download"]);
  if (host.includes("spotify")) return findMethod(scapr.spotify, ["spotify", "download"]);
  return findMethod(scapr.resolver, ["unshorten", "unshort", "resolve"]);
}
function toDownloads(raw) {
  const payload = raw?.result ?? raw?.data ?? raw;
  const candidates = payload?.downloads ?? payload?.medias ?? payload?.links ?? payload?.formats ?? [];
  const downloads = Array.isArray(candidates) ? candidates.map((item) => ({
    title: item?.title ?? item?.name,
    url: item?.url ?? item?.download ?? item?.link ?? "",
    quality: item?.quality ?? item?.resolution ?? item?.label,
    type: item?.type ?? item?.mimeType
  })).filter((item) => typeof item.url === "string" && /^https?:\/\//i.test(item.url)) : [];
  const directUrl = payload?.url ?? payload?.downloadUrl ?? payload?.download_url ?? payload?.destination ?? payload?.finalUrl;
  if (!downloads.length && typeof directUrl === "string" && /^https?:\/\//i.test(directUrl)) {
    downloads.push({ title: "Link hasil", url: directUrl, type: "link" });
  }
  return { payload, downloads };
}

app.get("/api/health", (_req, res) => res.json({
  ok: true, service: "Cimon Downloader", attribution: "ReyzaDev",
  message: "Backend aktif. Ketersediaan ekstraksi bergantung pada layanan sumber."
}));

app.post("/api/resolve", async (req, res) => {
  const parsed = validateUrl(req.body?.url);
  const tool = typeof req.body?.tool === "string" ? req.body.tool : "all";
  const allowedTools = new Set(["all", "video", "music", "audio", "profile", "bypass", "instagram", "tiktok"]);
  if (!parsed) return res.status(400).json({ ok: false, message: "URL tidak valid atau tidak diizinkan." });
  if (!allowedTools.has(tool)) return res.status(400).json({ ok: false, message: "Pilihan tool tidak valid." });

  try {
    // Dynamic import supports the package's ESM or CommonJS export shape.
    const loaded = await import("@coflyn/scrapr");
    const scrapr = loaded.default && Object.keys(loaded).length <= 2 ? loaded.default : loaded;
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    const chosen = chooseMethod(scrapr, host, tool);
    if (!chosen) {
      return res.status(501).json({
        ok: false,
        message: `Metode scraper untuk ${host} belum ditemukan. Periksa versi @coflyn/scrapr dan sesuaikan pemetaan metode di server.js.`
      });
    }

    let raw;
    try { raw = await Promise.race([
      Promise.resolve(chosen.fn(parsed.toString())),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 25000))
    ]); }
    catch {
      return res.status(502).json({
        ok: false,
        message: "Situs sumber gagal merespons, membatasi akses, atau membutuhkan metode lain. Coba tautan publik lain."
      });
    }
    if (!raw || raw.status === false || raw.ok === false) {
      return res.status(502).json({ ok: false, message: raw?.message || "Scraper tidak mengembalikan hasil." });
    }
    const { payload, downloads } = toDownloads(raw);
    if (!downloads.length) {
      return res.status(502).json({
        ok: false,
        message: "Respons scraper diterima, tetapi format hasil belum dikenali. Pemetaan hasil di server.js mungkin perlu disesuaikan."
      });
    }
    return res.json({
      ok: true,
      title: payload?.title ?? payload?.name ?? "Link berhasil diproses",
      thumbnail: payload?.thumbnail ?? payload?.thumbnail_url ?? payload?.image,
      downloads,
      source: chosen.name,
      message: "Link berhasil diproses. Gunakan hasil hanya jika Anda memiliki hak untuk mengunduh kontennya."
    });
  } catch (error) {
    console.error("[resolve]", error?.message || error);
    return res.status(500).json({
      ok: false,
      message: "Backend tidak dapat memuat modul scraper. Jalankan npm install dan periksa log server."
    });
  }
});

app.get("*", (_req, res) => res.sendFile(path.join(ROOT, "index.html")));
app.listen(PORT, () => console.log(`Cimon Downloader running at http://localhost:${PORT}`));
