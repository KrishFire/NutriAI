import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-debug-mode',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    let audioFile: File;
    
    // Check content type to determine how to handle the request
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle FormData (existing implementation)
      const formData = await req.formData();
      const file = formData.get('audio') as File;
      
      if (!file) {
        throw new Error('No audio file provided in FormData');
      }
      audioFile = file;
    } else if (contentType.includes('application/json')) {
      // Handle JSON with base64 audio
      const body = await req.json();
      
      if (body.storagePath) {
        // TODO: Implement fetching from Supabase Storage
        throw new Error('Storage path handling not yet implemented');
      } else if (body.audio && body.mimeType) {
        // Convert base64 to File
        const base64Data = body.audio;
        const mimeType = body.mimeType || 'audio/m4a';
        
        // Convert base64 to Uint8Array
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Create a File object
        audioFile = new File([bytes], 'audio.m4a', { type: mimeType });
      } else {
        throw new Error('Invalid JSON body: expected either "storagePath" or "audio" with "mimeType"');
      }
    } else {
      throw new Error(`Unsupported content type: ${contentType}`);
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (audioFile.size > maxSize) {
      throw new Error(`Audio file too large. Maximum size is 10MB, got ${(audioFile.size / 1024 / 1024).toFixed(2)}MB`);
    }

    // Validate file type
    const allowedTypes = ['audio/mp4', 'audio/m4a', 'audio/mpeg', 'audio/wav', 'audio/webm'];
    if (!allowedTypes.includes(audioFile.type)) {
      throw new Error(`Invalid audio format. Supported formats: ${allowedTypes.join(', ')}`);
    }

    // Create form data for OpenAI API
    const openAIFormData = new FormData();
    openAIFormData.append('file', audioFile);
    openAIFormData.append('model', 'whisper-1');
    openAIFormData.append('language', 'en'); // English for meal descriptions
    openAIFormData.append('prompt', 'This is a meal description for a food tracking app. Include details about portions, ingredients, and preparation methods.');

    // Call OpenAI Whisper API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: openAIFormData,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const result = await response.json();

    // Extract transcription
    const transcription = result.text || '';

    // Log for debugging if debug mode is enabled
    const debugMode = req.headers.get('x-debug-mode') === 'true';
    if (debugMode) {
      console.log('Transcription result:', {
        text: transcription,
        audioSize: audioFile.size,
        audioType: audioFile.type,
      });
    }

    // Return success response
    return new Response(
      JSON.stringify({
        transcription,
        confidence: 1.0, // Whisper doesn't provide confidence scores
        duration: result.duration || null,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Transcription error:', error);

    // Return error response
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to transcribe audio',
        stage: 'transcription',
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      }
    );
  }
});