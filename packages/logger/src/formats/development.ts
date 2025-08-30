import { format } from "winston";

export const developmentFormat = format.combine(
    format.colorize(),
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(({ level, message, timestamp, ...metadata }) => {
        console.log("🚀 ~ metadata:", metadata)
        // Remove internal Winston symbols
        // const cleanMeta = Object.fromEntries(
        //     Object.entries(metadata).filter(([key]) => !key.startsWith("Symbol("))
        // );

        // Format metadata if present
        let metaStr = "";
        if (Object.keys(metadata).length > 0) {
            metaStr = `\n${JSON.stringify(metadata, null, 2)}`;
        }

        return `${timestamp} [${level}] ${message}${metaStr}`;
    })
);
