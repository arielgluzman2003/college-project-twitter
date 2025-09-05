const mongoose = require('mongoose');

const VisualContentSchema = new mongoose.Schema(
  {
    // Where the actual content is. Prefer a URL or storage key instead of raw data.
    content: {
      type: String, // e.g., "https://cdn.example.com/abc.jpg" or "s3://bucket/key"
      required: true,
      trim: true,
    },

    // MIME type is precise: "image/png", "video/mp4", etc.
    mimeType: {
      type: String,
      required: true,
      validate: {
        validator: v => /^[a-z]+\/[a-z0-9+.-]+$/i.test(v),
        message: 'mimeType must look like "type/subtype", e.g. image/png',
      },
    },

    // Broad media category, derived from mimeType, but handy for queries/UI
    mediaType: {
      type: String,
      enum: ['image', 'video', 'audio', 'document', 'other'],
      required: true,
    },

    // Optional metadata
    fileName: { type: String, trim: true },
    fileSizeBytes: { type: Number, min: 0 },
    width: { type: Number, min: 1 },   // for images/video frames
    height: { type: Number, min: 1 },
    durationSec: { type: Number, min: 0 }, // for video/audio
    checksum: { type: String, trim: true }, // e.g., sha256 for dedupe

  },
  { _id: false }
);

const Visualcontent = mongoose.model('Visualcontent', VisualContentSchema);
module.exports = Visualcontent;
