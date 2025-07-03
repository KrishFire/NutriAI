# Quick Food Search Debug (1 minute fix)

We'll help you fix the search issue. This takes about 1 minute.

## DEBUG_FLAG_1: Enable Debug Mode (30 seconds)

1. **Add this line** to your `.env` file:
   ```
   EXPO_PUBLIC_DEBUG_FOOD_SEARCH=true
   ```

2. **Restart the app completely**:
   - Stop the app (Ctrl+C)
   - Run `npm start` again

## DEBUG_FLAG_2: Run Test Search

1. Open the app
2. Go to **Manual Food Entry**
3. Search exactly for: **chicken breast**
4. Wait 5 seconds

## DEBUG_FLAG_3: Copy the Important Logs

In your terminal, look for these emoji markers:

```
🔍 [SEARCH_START] Starting food search
❌ [AUTH_ERROR] Session error  
ℹ️ [API_CALL_START] Calling food-search
```

**Copy ALL lines between** `🔍 [SEARCH_START]` and the final result.

## DEBUG_FLAG_4: Quick Fixes

See these in your logs? Here's what to do:

| If you see... | Do this... |
|---------------|------------|
| `❌ [AUTH_ERROR]` | Log out → Log back in |
| `🔍 [CACHE_HIT]` | Clear app data and retry |
| No logs at all | Check you added the .env line |

---

<details>
<summary>📋 **Need More Help?** (Click to expand)</summary>

### Other Test Searches
If "chicken breast" works, also try:
- Single word: `cheese`
- With special chars: `M&M's`

### What the Logs Mean
- `🔍` = Search operations
- `❌` = Errors that need fixing
- `ℹ️` = Normal info messages
- `🔐` = Login/auth checks (normal)

### Sharing Your Results
Email us with:
1. The logs between `[SEARCH_START]` and end
2. What search term failed
3. Error message you saw (screenshot helps!)

### Clear App Cache
- **iOS**: Settings → General → iPhone Storage → NutriAI → Delete App
- **Android**: Settings → Apps → NutriAI → Storage → Clear Data
- **Expo Go**: Hold app icon → Delete → Reinstall

</details>

**Remember:** Remove the debug line from `.env` when done!