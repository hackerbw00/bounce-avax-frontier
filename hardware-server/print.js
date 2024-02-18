const { ThermalPrinter, PrinterTypes } = require("node-thermal-printer");

module.exports = async function print({
  from,
  vault,
  posTerminal,
  fromAmount,
  fromToken,
  action,
  qrCode,
  chain,
}) {
  let printer = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: "/dev/usb/lp0", // Printer interface
    width: 58,
  });
  const isConnected = await printer.isPrinterConnected();
  console.log("Printer connected:", isConnected);

  printer.beep();

  printer.alignCenter();
  await printer.printImage("./bounce.png");

  printer.alignLeft();
  printer.println("Chain:");
  printer.alignRight();
  printer.println(chain);

  printer.alignLeft();
  printer.println("From:");
  printer.alignRight();
  printer.setTypeFontB();
  printer.println(from);
  printer.setTextNormal();

  printer.alignLeft();
  printer.println("From Vault:");
  printer.alignRight();
  printer.setTypeFontB();
  printer.println(vault);
  printer.setTextNormal();

  printer.alignLeft();
  printer.println("PoS Terminal:");
  printer.alignRight();
  printer.setTypeFontB();
  printer.println(posTerminal);
  printer.setTextNormal();

  printer.alignLeft();
  printer.println("Amount:");
  printer.alignRight();
  printer.println(`${fromAmount} ${fromToken}`);

  printer.alignLeft();
  printer.println("Action:");
  printer.alignRight();
  printer.setTypeFontB();
  printer.println(action);
  printer.setTextNormal();

  printer.alignCenter();
  printer.drawLine();
  printer.printQR(qrCode, {
    cellSize: 6,
  });

  printer.cut({
    verticalTabAmount: 1,
  });

  try {
    await printer.execute();
    console.log("Print success.");
  } catch (error) {
    console.error("Print error:", error);
  }
};
