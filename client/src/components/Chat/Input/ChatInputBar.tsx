import { Paperclip, Mic, ArrowUp, Wand2 } from 'lucide-react';
import { Button } from '~/components/ui';
import { TextareaAutosize, TooltipAnchor } from '~/components/ui';

export function ChatInputBar() {
  return (
    <div className="relative">
      <TextareaAutosize
        placeholder="Message GPT-4o"
        className="w-full rounded-2xl border-none bg-[#24243e] p-4 pr-28 resize-none min-h-[52px] text-white/90 placeholder:text-white/50 focus-visible:ring-1 focus-visible:ring-cyan-400 focus-visible:ring-offset-0"
      />
      <div className="absolute bottom-3 right-3 flex items-center gap-1">
        <TooltipAnchor description="Attach files">
          <Button variant="ghost" size="icon" className="rounded-full text-white/70 hover:text-cyan-400 hover:bg-white/10">
            <Paperclip className="h-5 w-5" />
          </Button>
        </TooltipAnchor>
        <TooltipAnchor description="Use prompt">
          <Button variant="ghost" size="icon" className="rounded-full text-white/70 hover:text-cyan-400 hover:bg-white/10">
            <Wand2 className="h-5 w-5" />
          </Button>
        </TooltipAnchor>
        <TooltipAnchor description="Use microphone">
          <Button variant="ghost" size="icon" className="rounded-full text-white/70 hover:text-cyan-400 hover:bg-white/10">
            <Mic className="h-5 w-5" />
          </Button>
        </TooltipAnchor>
        <Button size="icon" className="rounded-full w-9 h-9 bg-cyan-500 hover:bg-cyan-600 text-white">
          <ArrowUp className="h-5 w-5" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </div>
  );
}