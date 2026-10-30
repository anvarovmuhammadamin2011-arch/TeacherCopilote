const escapeXML = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
export function downloadBlob(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
// Minimal standards-based OOXML package: real .docx, without renaming HTML.
function zip(entries: Record<string, string>) {
  const enc = new TextEncoder();
  const parts: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  const u16 = (v: DataView, o: number, n: number) => v.setUint16(o, n, true);
  const u32 = (v: DataView, o: number, n: number) => v.setUint32(o, n, true);
  for (const [name, value] of Object.entries(entries)) {
    const n = enc.encode(name),
      d = enc.encode(value);
    let crc = 0xffffffff;
    for (const b of d) {
      crc ^= b;
      for (let i = 0; i < 8; i++)
        crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
    crc = (crc ^ 0xffffffff) >>> 0;
    const local = new Uint8Array(30 + n.length),
      v = new DataView(local.buffer);
    u32(v, 0, 0x04034b50);
    u16(v, 4, 20);
    u32(v, 14, crc);
    u32(v, 18, d.length);
    u32(v, 22, d.length);
    u16(v, 26, n.length);
    local.set(n, 30);
    parts.push(local, d);
    const c = new Uint8Array(46 + n.length),
      cv = new DataView(c.buffer);
    u32(cv, 0, 0x02014b50);
    u16(cv, 4, 20);
    u16(cv, 6, 20);
    u32(cv, 16, crc);
    u32(cv, 20, d.length);
    u32(cv, 24, d.length);
    u16(cv, 28, n.length);
    u32(cv, 42, offset);
    c.set(n, 46);
    central.push(c);
    offset += local.length + d.length;
  }
  const size = central.reduce((s, c) => s + c.length, 0),
    end = new Uint8Array(22),
    ev = new DataView(end.buffer);
  u32(ev, 0, 0x06054b50);
  u16(ev, 8, central.length);
  u16(ev, 10, central.length);
  u32(ev, 12, size);
  u32(ev, 16, offset);
  return new Blob([...parts, ...central, end] as BlobPart[], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}
export function wordBlob(title: string, text: string) {
  return zip({
    "[Content_Types].xml":
      '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
    "_rels/.rels":
      '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
    "word/document.xml":
      '<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' +
      [title, ...text.replace(/\f/g, "\n\f\n").split("\n")]
        .map((line, index) => {
          if (line === "\f")
            return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
          const heading =
            index === 0 ||
            /^(?:[A-D] VARIANT|Kirish|Asosiy tushuntirish|Asosiy tushunchalar|Yechilgan misol|Mustaqil mashqlar|Mashqlar|Xulosa|Takrorlash savollari|Ko‘p uchraydigan xato)$/.test(
              line.trim(),
            );
          return (
            "<w:p><w:pPr>" +
            (heading ? "<w:keepNext/>" : "") +
            '<w:spacing w:after="' +
            (heading ? "160" : "80") +
            '" w:line="260" w:lineRule="auto"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:color w:val="000000"/><w:sz w:val="' +
            (index === 0 ? "32" : "22") +
            '"/>' +
            (heading ? "<w:b/>" : "") +
            '</w:rPr><w:t xml:space="preserve">' +
            escapeXML(line) +
            "</w:t></w:r></w:p>"
          );
        })
        .join("") +
      '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr></w:body></w:document>',
  });
}
export function exportWord(title: string, text: string) {
  downloadBlob(
    title.replace(/[^\p{L}\p{N} _-]/gu, "").slice(0, 80) + ".docx",
    wordBlob(title, text),
  );
}
// The same escaped markup is used in print and in export verification.
export function printableHTML(title: string, text: string) {
  const pages = text
    .split("\f")
    .map((page, index) => {
      const lines = page.trim().split("\n");
      const first = lines.shift() || " ";
      return (
        '<div class="export-page"><p' +
        (index ? ' style="page-break-before:always;break-before:page"' : "") +
        ">" +
        escapeXML(first) +
        "</p>" +
        lines
          .join("\n")
          .trim()
          .split(/\n\s*\n/)
          .map(
            (block) =>
              '<div class="export-block">' +
              block
                .split("\n")
                .map((line) => "<p>" + escapeXML(line || " ") + "</p>")
                .join("") +
              "</div>",
          )
          .join("") +
        "</div>"
      );
    })
    .join("");
  return (
    '<!doctype html><html lang="uz"><head><meta charset="utf-8"><title>' +
    escapeXML(title) +
    '</title><style>@page{size:A4;margin:18mm}body{font:11pt Arial,"DejaVu Sans",sans-serif;line-height:1.6;color:#17243b}h1{font-size:18pt;line-height:1.3;color:#000}p{white-space:pre-wrap;margin:0 0 5pt}h1,p{overflow-wrap:anywhere}.export-block{break-inside:avoid;page-break-inside:avoid;margin-bottom:10pt}</style></head><body><h1>' +
    escapeXML(title) +
    "</h1>" +
    pages +
    "</body></html>"
  );
}
// Navigation and private profile data stay outside the printable document.
export function printDocument(title: string, text: string) {
  const frame = document.createElement("iframe");
  frame.style.cssText = "position:fixed;width:0;height:0;border:0";
  document.body.append(frame);
  const doc = frame.contentDocument!;
  doc.open();
  doc.write(printableHTML(title, text));
  doc.close();
  setTimeout(() => {
    frame.contentWindow?.focus();
    frame.contentWindow?.print();
    setTimeout(() => frame.remove(), 60000);
  }, 250);
}
