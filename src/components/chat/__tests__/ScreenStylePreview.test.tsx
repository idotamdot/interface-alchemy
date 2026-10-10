import { afterEach,expect,test } from "vitest";
import {cleanup,fireEvent,render,screen} from "@testing-library/react";
import {ScreenStylePreview} from "../ScreenStylePreview";
afterEach(cleanup);
const direction={name:"Warm editorial",direction:"Serif headings and geometric cards",rationale:"Readable",palette:{background:"#ffffff",text:"#000000",mutedText:"#333333",accent:"#ffff00",accentText:"#000000",border:"#000000"}};
test("renders a screen with chosen palette and typography, with full-screen review",()=>{
 render(<ScreenStylePreview direction={direction}/>);
 const preview=screen.getByRole("img");
 expect(preview.style.backgroundColor).toBe("rgb(255, 255, 255)");
 expect(preview.style.fontFamily).toContain("Georgia");
 expect(preview.textContent).toContain("Explore the collection");
 fireEvent.click(screen.getByRole("button",{name:"View Warm editorial full screen"}));
 expect(screen.getByRole("dialog")).toBeDefined();
 fireEvent.click(screen.getByRole("button",{name:"Back to designs"}));
 expect(screen.queryByRole("dialog")).toBeNull();
});
test("repairs low contrast tokens and treats AI descriptions as text",()=>{
 render(<ScreenStylePreview direction={{...direction,name:"<script>example</script>",palette:{...direction.palette,text:"#ffffff"}}}/>);
 expect(screen.getByRole("img").style.color).toBe("rgb(0, 0, 0)");
 expect(document.querySelector("script")).toBeNull();
});
