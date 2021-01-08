const Locize = require("i18next-locize-backend")
const NextI18Next = require("next-i18next").default

const {
  NEXT_JS_LOCIZE_PROJECT_ID: locizeProjectId,
  NEXT_JS_LOCIZE_DEV_API_KEY: locizeApiKey,
  NEXT_JS_LOCIZE_VERSION: locizeVersion
} = process.env

module.exports = new NextI18Next({
  use: [Locize],
  saveMissing: true,
  defaultLanguage: "en",
  fallbackLng: "en",
  otherLanguages: ["es"],
  backend: {
    projectId: locizeProjectId,
    apiKey: locizeApiKey,
    version: locizeVersion || "latest",
    referenceLng: "en",
  }
})