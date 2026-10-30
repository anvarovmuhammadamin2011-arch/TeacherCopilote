import type { MathTask } from "./curriculum";
function value(s: string) {
  if (s.includes("/")) {
    const [a, b] = s.split("/").map(Number);
    return a / b;
  }
  return Number(s);
}
function expected(id: string, p: string): string | number {
  let a: number, b: number, c: number, d: number, m: RegExpMatchArray | null;
  const nums = (p.match(/\d+/g) || []).map(Number);
  switch (id) {
    case "arithmetic":
      [a, b, c] = nums;
      return a + b * c;
    case "multiply":
      [a, b] = nums;
      return a * b;
    case "fractions":
    case "fraction-subtract":
    case "fraction-multiply":
      [a, b, c, d] = nums;
      return id === "fractions"
        ? a / b + c / d
        : id === "fraction-subtract"
          ? a / b - c / d
          : (a / b) * (c / d);
    case "percent":
      [a, b] = nums;
      return (a * b) / 100;
    case "ratio":
      [a, b, c] = nums;
      return (a * b) / c;
    case "linear":
      if ((m = p.match(/^(\d+)\(x \+ (\d+)\) − (\d+)x = (\d+)/))) {
        [, a, b, c, d] = m.map(Number);
        return (d - a * b) / (a - c);
      }
      if ((m = p.match(/^(\d+)x \+ (\d+) = (\d+)x \+ (\d+)/))) {
        [, a, b, c, d] = m.map(Number);
        return (d - b) / (a - c);
      }
      [a, b, c] = nums;
      return (c - b) / a;
    case "quadratic":
      [b, c] = nums;
      return `${(b - Math.sqrt(b * b - 4 * c)) / 2}; ${(b + Math.sqrt(b * b - 4 * c)) / 2}`;
    case "powers":
      [a, b, c, d] = nums;
      return `${a}^${b + d}`;
    case "rectangle":
      [a, b] = nums;
      return `${a * b} cm²`;
    case "triangle":
      [a, b] = nums;
      return `${180 - a - b}°`;
    case "pythagoras":
      [a, b] = nums;
      return `${Math.sqrt(a * a + b * b)} cm`;
    case "function":
      [a, b, c] = nums;
      return a * c + b;
    case "trig":
      [a, b, c] = nums;
      return p.includes("cos α") ? b / c : a / c;
    case "probability":
      [a, b] = nums;
      return a / (a + b);
    case "derivative":
      [a, b] = nums;
      return `${a * b}x^${b - 1}`;
    default:
      throw Error(id);
  }
}

function arithmetic(text: string): number {
  const tokens = text.match(/\d+(?:\.\d+)?|[()+\-*/]/g) || [];
  if (tokens.join("") !== text.replace(/\s/g, ""))
    throw new Error("Unsupported expression");
  let at = 0;
  const atom = (): number => {
    const t = tokens[at++];
    if (t === "(") {
      const v = sum();
      if (tokens[at++] !== ")") throw new Error("Unclosed expression");
      return v;
    }
    if (t === "-") return -atom();
    if (t === "+") return atom();
    const n = Number(t);
    if (!Number.isFinite(n)) throw new Error("Invalid number");
    return n;
  };
  const product = (): number => {
    let v = atom();
    while (tokens[at] === "*" || tokens[at] === "/") {
      const op = tokens[at++],
        n = atom();
      v = op === "*" ? v * n : v / n;
    }
    return v;
  };
  const sum = (): number => {
    let v = product();
    while (tokens[at] === "+" || tokens[at] === "-") {
      const op = tokens[at++],
        n = product();
      v = op === "+" ? v + n : v - n;
    }
    return v;
  };
  const v = sum();
  if (at !== tokens.length || !Number.isFinite(v))
    throw new Error("Invalid result");
  return v;
}
export function verifyMathTask(id: string, t: MathTask) {
  const exp = expected(id, t.prompt);
  const valid =
    typeof exp === "number"
      ? Math.abs(value(t.answer) - exp) < 1e-9
      : t.answer === exp;
  if (!valid) return false;
  if (id === "linear") {
    for (const step of t.steps) {
      if (!step.includes("=")) continue;
      const parts = step
        .replace(/^Tekshirish:\s*/, "")
        .replace(/×/g, "*")
        .replace(/−/g, "-")
        .replace(/(\d)x/g, `$1*(${t.answer})`)
        .replace(/\bx\b/g, `(${t.answer})`)
        .replace(/(\d)\(/g, "$1*(")
        .split("=");
      const values = parts.map(arithmetic);
      if (values.some((v) => Math.abs(v - values[0]) > 1e-9)) return false;
    }
  }
  return true;
}
