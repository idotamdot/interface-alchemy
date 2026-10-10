import { expect, test } from "vitest";
import { createVisualStylePackage, visualStylePackageSchema } from "../visual-style-package";

const direction = {
 name:"Midnight Atelier",direction:"Editorial, calm and luminous",rationale:"Creates a strong focal point",
 palette:{background:"#080B14",text:"#F2EDFF",mutedText:"#C4C3D7",accent:"#BCAEFA",accentText:"#080B14",border:"#BCAEFA"}
};
test("exports a versioned, non-executable visual direction",()=>{
 const pkg=createVisualStylePackage(direction);
 expect(pkg.format).toBe("screen-seer-visual/v1");
 expect(pkg.source).toBe("interface-alchemy");
 expect(pkg.direction).toEqual(direction);
 expect(pkg.review).toEqual({paletteChecked:true,renderedAccessibilityVerified:false,implementationVerified:false});
 expect(visualStylePackageSchema.safeParse({...pkg,script:"alert(1)"}).success).toBe(false);
});
test("rejects an unreadable visual direction instead of exporting it",()=>{
 expect(()=>createVisualStylePackage({...direction,palette:{...direction.palette,mutedText:"#080B14"}})).toThrow();
});
