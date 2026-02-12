// src/components/InputSection.tsx
import { toast } from "solid-toast";

interface InputSectionProps {
  url: string;
  setUrl: (url: string) => void;
  loading: boolean;
  autoProcessing: boolean;
  onSubmit: (e: Event) => void;
  onPaste: () => void;
  onCancelAutoProcessing: () => void;
  error: string;
  extractTikTokUrl: (text: string) => string;
  cleanTikTokUrl: (url: string) => string;
  isValidTikTokUrl: (url: string) => boolean;
}

function InputSection(props: InputSectionProps) {
  const handleInputChange = (e: Event) => {
    const newUrl = (e.target as HTMLInputElement).value;
    console.log("Input changed:", newUrl);
    props.setUrl(newUrl);
    
    // Clear previous error when user starts typing
    // Note: Error handling is in parent, but we can clear here if needed
    // setError(""); // Moved to parent if centralized

    // Auto-detect and process promotional content when typing/pasting into input
    if (newUrl && newUrl.length > 50 && newUrl.includes('tiktok')) {
      const extractedUrl = props.extractTikTokUrl(newUrl);
      const cleanedUrl = props.cleanTikTokUrl(extractedUrl);
      
      // Check if this looks like promotional content
      const isPromotionalContent = (
        newUrl.length > cleanedUrl.length + 15 &&
        (
          newUrl.toLowerCase().includes('tiktok lite') ||
          newUrl.toLowerCase().includes('download tiktok') ||
          newUrl.toLowerCase().includes('shared via') ||
          newUrl.toLowerCase().includes('this post is') ||
          newUrl.includes('://www.tiktok.com/tiktoklite') ||
          newUrl.split(' ').length > 8
        )
      );

      if (isPromotionalContent && cleanedUrl !== newUrl) {
        console.log("Auto-processing detected in input field");
        props.setUrl(cleanedUrl);
        // Trigger auto-processing via parent state
        // Note: setAutoProcessing(true) is in parent, but we can emit event or call callback
        // For now, assuming parent handles via onSubmit or separate callback
      }
    }
  };

  const handlePasteInInput = (e: Event) => {
    // Handle paste event directly in the input field
    setTimeout(() => {
      const pastedText = (e.target as HTMLInputElement).value;
      console.log("Direct paste in input:", pastedText);
      
      if (pastedText && pastedText.length > 50) {
        const extractedUrl = props.extractTikTokUrl(pastedText);
        const cleanedUrl = props.cleanTikTokUrl(extractedUrl);
        
        const isPromotionalContent = (
          pastedText.length > cleanedUrl.length + 15 &&
          (
            pastedText.toLowerCase().includes('tiktok lite') ||
            pastedText.toLowerCase().includes('download tiktok') ||
            pastedText.toLowerCase().includes('shared via') ||
            pastedText.toLowerCase().includes('this post is') ||
            pastedText.includes('://www.tiktok.com/tiktoklite') ||
            pastedText.split(' ').length > 8
          )
        );

        if (isPromotionalContent && cleanedUrl !== pastedText) {
          console.log("Auto-processing pasted promotional content");
          props.setUrl(cleanedUrl);
          // Trigger auto-processing via parent
        }
      }
    }, 100); // Small delay to let paste complete
  };

  return (
    <div class="max-w-6xl mx-auto">
      <div class="download-box">
        <div class="p-1">
          <form class="flex flex-col md:flex-row items-stretch md:items-center gap-2"
            onSubmit={props.onSubmit}
          >
            <div class="relative flex-grow bg-white rounded shadow">
              <input type="text"
                value={props.url}
                onInput={handleInputChange}
                onPaste={handlePasteInInput}
                placeholder="Paste TikTok video link or shared content here (we'll extract the URL automatically)"
                class="w-full h-14 border-gray-700 text-black px-5 pr-20 focus:outline-none focus:border-transparent transition-all duration-300"
              />
              <button type="button" 
                onClick={props.onPaste} 
                class="absolute right-3 top-1/2 -translate-y-1/2 bg-rose-300 hover:bg-rose-400 text-black text-lg px-4 py-2 border-2 border-rose-600 hover:border-rose-700 rounded-md font-normal transition-all duration-300 flex items-center gap-2">
                
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" fill="none" viewBox="0 0 16 17">
  <path fill="#252638" d="M1.333 7.5v1.954c0 1.615.396 2.27.91 2.802.533.515 1.189.91 2.803.91h3.908c1.613 0 2.27-.395 2.802-.91.515-.532.91-1.187.91-2.802V5.546c0-1.614-.395-2.27-.91-2.802-.532-.514-1.189-.91-2.802-.91H5.046c-1.614 0-2.27.396-2.803.91-.514.532-.91 1.188-.91 2.802z"></path>
  <path stroke="#252638" stroke-linecap="round" stroke-linejoin="round" d="M4.243 14.256c.533.514 1.189.91 2.803.91h3.908c1.614 0 2.27-.396 2.802-.91.515-.532.91-1.188.91-2.802V7.546c0-1.614-.395-2.27-.91-2.802"></path>
</svg>
                Paste
              </button>
            </div>
            <button type="submit" 
              disabled={props.loading || props.autoProcessing}
              class="h-14 px-8 bg-amber-500 shadow rounded disabled:from-gray-500 disabled:to-gray-400 text-lg text-white font-medium flex items-center justify-center gap-2 disabled:transform-none disabled:cursor-not-allowed">
              {props.loading ? (
                <>
                  <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Processing...
                </>
              ) : props.autoProcessing ? (
                <>
                  <svg class="animate-pulse h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="3"/>
                    <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="2" opacity="0.5"/>
                  </svg>
                  Auto-starting...
                </>
              ) : (
                <>
                Download
				 
                </>
              )}
            </button>
          </form>
          
          {/* Auto-processing indicator with cancel option */}
          {props.autoProcessing && (
            <div class="mt-3 p-3 bg-blue-100 border border-blue-300 flex items-center justify-between">
              <div class="flex items-center gap-2 text-blue-700">
                <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                <span class="text-sm font-medium">Auto-processing extracted URL...</span>
              </div>
              <button 
                onClick={props.onCancelAutoProcessing}
                class="text-blue-600 hover:text-blue-800 text-sm underline transition-colors">
                Cancel
              </button>
            </div>
          )}
          
          
        </div>
        {/* URL Format Help */}
        <div class="text-base text-white/70">
          <p>
            {props.autoProcessing ? (
              <span class="flex items-center gap-1">
                <svg class="animate-spin h-3 w-3" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Auto-processing TikTok Lite shared content...
              </span>
            ) : (
              ""
            )}
          </p>
        </div>
      </div>

      {props.error && (
        <div class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <strong>Error:</strong>
          </div>
          <p class="mt-1">{props.error}</p>
        </div>
      )}
    </div>
  );
}


export default InputSection;
