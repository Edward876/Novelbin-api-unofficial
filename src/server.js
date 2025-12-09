const express = require('express');
const { 
    scrapePopularNovels, 
    scrapeLatestNovels, 
    scrapeSearch, 
    scrapeNovelDetails, 
    scrapeChapterContent 
} = require('./scrapers/novels');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Routes

app.get('/', (req, res) => {
    res.json({
        name: "NovelBin Unofficial API",
        version: "1.0.0",
        endpoints: [
            { method: "GET", path: "/novels/popular", description: "Get popular novels" },
            { method: "GET", path: "/novels/latest", description: "Get latest released novels" },
            { method: "GET", path: "/novels/search?keyword=...", description: "Search novels" },
            { method: "GET", path: "/novels/:id", description: "Get novel details and chapters" },
            { method: "GET", path: "/novels/:id/info", description: "Get novel details (no chapters)" },
            { method: "GET", path: "/novels/:id/cover", description: "Get novel cover image URL" },
            { method: "GET", path: "/novels/:id/chapters/:chapterId", description: "Get chapter content" }
        ]
    });
});

app.get('/novels/popular', async (req, res) => {
    try {
        const novels = await scrapePopularNovels();
        res.json(novels);
    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
});

app.get('/novels/latest', async (req, res) => {
    try {
        const novels = await scrapeLatestNovels();
        res.json(novels);
    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
});

app.get('/novels/search', async (req, res) => {
    const { keyword } = req.query;
    if (!keyword) {
        return res.status(400).json({ error: true, message: "Keyword query parameter is required" });
    }
    try {
        const results = await scrapeSearch(keyword);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
});

app.get('/novels/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const novel = await scrapeNovelDetails(id);
        if (!novel.title) {
             return res.status(404).json({ error: true, message: "Novel not found" });
        }
        res.json(novel);
    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
});

app.get('/novels/:id/info', async (req, res) => {
    const { id } = req.params;
    try {
        const novel = await scrapeNovelDetails(id);
        if (!novel.title) {
             return res.status(404).json({ error: true, message: "Novel not found" });
        }
        // Remove chapters from response
        const { chapters, ...info } = novel;
        res.json(info);
    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
});

app.get('/novels/:id/cover', async (req, res) => {
    const { id } = req.params;
    try {
        const novel = await scrapeNovelDetails(id);
        if (!novel.title) {
             return res.status(404).json({ error: true, message: "Novel not found" });
        }
        res.json({ cover: novel.cover });
    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
});

app.get('/novels/:id/chapters', async (req, res) => {
    const { id } = req.params;
    try {
        const novel = await scrapeNovelDetails(id);
        if (!novel.title) {
             return res.status(404).json({ error: true, message: "Novel not found" });
        }
        res.json(novel.chapters);
    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
});

app.get('/novels/:id/chapters/:chapterId', async (req, res) => {
    const { id, chapterId } = req.params;
    try {
        const chapter = await scrapeChapterContent(id, chapterId);
        if (!chapter.content) {
            return res.status(404).json({ error: true, message: "Chapter content not found" });
        }
        res.json(chapter);
    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
