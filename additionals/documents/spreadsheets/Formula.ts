/**
 * @module      additionals/spreadsheet/Formula
 * @author      Riccardo Angeli
 * @version     0.1.0
 * @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 * @license     MIT / Commercial (dual license)
 *
 * @description Formula lexer, Pratt parser, dependency extractor and evaluator.
 */

import type { SpreadsheetTypes } from './Types.ts';
import { SpreadsheetAddress } from './Address.ts';

export namespace Formula
{
    export type Node =
        | { Kind: 'Number'; Value: number }
        | { Kind: 'String'; Value: string }
        | { Kind: 'Boolean'; Value: boolean }
        | { Kind: 'Reference'; Address: SpreadsheetTypes.CellAddress }
        | { Kind: 'Range'; Range: SpreadsheetTypes.CellRange }
        | { Kind: 'Unary'; Operator: '+' | '-'; Value: Node }
        | { Kind: 'Binary'; Operator: '+' | '-' | '*' | '/' | '^'; Left: Node; Right: Node }
        | { Kind: 'Call'; Name: string; Arguments: Node[] };

    type TokenType = 'number' | 'string' | 'identifier' | 'operator' | 'lparen' | 'rparen' | 'comma' | 'colon' | 'eof';

    interface Token
    {
        Type: TokenType;
        Value: string;
    }

    class Lexer
    {
        readonly #source: string;
        #index = 0;

        constructor(source: string)
        {
            this.#source = source;
        }

        Next(): Token
        {
            while(/\s/.test(this.#source[this.#index] ?? ''))
            {
                this.#index++;
            }

            if(this.#index >= this.#source.length)
            {
                return { Type: 'eof', Value: '' };
            }

            const current = this.#source[this.#index];

            if(/[0-9.]/.test(current))
            {
                const start = this.#index++;

                while(/[0-9.]/.test(this.#source[this.#index] ?? ''))
                {
                    this.#index++;
                }

                return { Type: 'number', Value: this.#source.slice(start, this.#index) };
            }

            if(current === '"')
            {
                this.#index++;
                let value = '';

                while(this.#index < this.#source.length)
                {
                    const char = this.#source[this.#index++];

                    if(char === '"')
                    {
                        if(this.#source[this.#index] === '"')
                        {
                            value += '"';
                            this.#index++;
                            continue;
                        }

                        return { Type: 'string', Value: value };
                    }

                    value += char;
                }

                throw new Error('Unterminated formula string.');
            }

            if(/[A-Za-z_$]/.test(current))
            {
                const start = this.#index++;

                while(/[A-Za-z0-9_.$]/.test(this.#source[this.#index] ?? ''))
                {
                    this.#index++;
                }

                return { Type: 'identifier', Value: this.#source.slice(start, this.#index) };
            }

            this.#index++;

            if('+-*/^'.includes(current)) return { Type: 'operator', Value: current };
            if(current === '(') return { Type: 'lparen', Value: current };
            if(current === ')') return { Type: 'rparen', Value: current };
            if(current === ',') return { Type: 'comma', Value: current };
            if(current === ':') return { Type: 'colon', Value: current };

            throw new Error(`Unexpected formula character: ${current}`);
        }
    }

    export class Parser
    {
        readonly #lexer: Lexer;
        #token: Token;

        constructor(source: string)
        {
            this.#lexer = new Lexer(source.startsWith('=') ? source.slice(1) : source);
            this.#token = this.#lexer.Next();
        }

        Parse(): Node
        {
            const node = this.Expression(0);

            if(this.#token.Type !== 'eof')
            {
                throw new Error(`Unexpected formula token: ${this.#token.Value}`);
            }

            return node;
        }

        private Expression(minimum: number): Node
        {
            let left = this.Prefix();

            while(this.#token.Type === 'operator')
            {
                const operator = this.#token.Value as '+' | '-' | '*' | '/' | '^';
                const precedence = operator === '+' || operator === '-' ? 10 : operator === '*' || operator === '/' ? 20 : 30;

                if(precedence < minimum)
                {
                    break;
                }

                this.Advance();
                const right = this.Expression(precedence + (operator === '^' ? 0 : 1));
                left = { Kind: 'Binary', Operator: operator, Left: left, Right: right };
            }

            return left;
        }

        private Prefix(): Node
        {
            if(this.#token.Type === 'operator' && (this.#token.Value === '+' || this.#token.Value === '-'))
            {
                const operator = this.#token.Value as '+' | '-';
                this.Advance();
                return { Kind: 'Unary', Operator: operator, Value: this.Expression(40) };
            }

            if(this.#token.Type === 'number')
            {
                const value = Number(this.#token.Value);
                this.Advance();

                if(!Number.isFinite(value))
                {
                    throw new Error('Invalid numeric literal.');
                }

                return { Kind: 'Number', Value: value };
            }

            if(this.#token.Type === 'string')
            {
                const value = this.#token.Value;
                this.Advance();
                return { Kind: 'String', Value: value };
            }

            if((this.#token as Token).Type === 'lparen')
            {
                this.Advance();
                const value = this.Expression(0);
                this.Expect('rparen');
                return value;
            }

            if(this.#token.Type === 'identifier')
            {
                const identifier = this.#token.Value;
                this.Advance();

                if((this.#token as Token).Type === 'lparen')
                {
                    this.Advance();
                    const args: Node[] = [];

                    if((this.#token as Token).Type !== 'rparen')
                    {
                        while(true)
                        {
                            args.push(this.Expression(0));

                            if((this.#token as Token).Type !== 'comma')
                            {
                                break;
                            }

                            this.Advance();
                        }
                    }

                    this.Expect('rparen');
                    return { Kind: 'Call', Name: identifier.toUpperCase(), Arguments: args };
                }

                if(/^\$?[A-Za-z]+\$?\d+$/.test(identifier))
                {
                    const start = SpreadsheetAddress.Parse(identifier);

                    if((this.#token as Token).Type === 'colon')
                    {
                        this.Advance();

                        if(this.#token.Type !== 'identifier')
                        {
                            throw new Error('Expected cell reference after range colon.');
                        }

                        const end = SpreadsheetAddress.Parse(this.#token.Value);
                        this.Advance();
                        return { Kind: 'Range', Range: SpreadsheetAddress.NormalizeRange({ Start: start, End: end }) };
                    }

                    return { Kind: 'Reference', Address: start };
                }

                if(identifier.toUpperCase() === 'TRUE') return { Kind: 'Boolean', Value: true };
                if(identifier.toUpperCase() === 'FALSE') return { Kind: 'Boolean', Value: false };

                throw new Error(`Unknown formula name: ${identifier}`);
            }

            throw new Error(`Unexpected formula token: ${this.#token.Value}`);
        }

        private Advance(): void
        {
            this.#token = this.#lexer.Next();
        }

        private Expect(type: TokenType): void
        {
            if(this.#token.Type !== type)
            {
                throw new Error(`Expected ${type}, found ${this.#token.Value || this.#token.Type}`);
            }

            this.Advance();
        }
    }

    export function Dependencies(node: Node, result: Set<number> = new Set<number>()): Set<number>
    {
        switch(node.Kind)
        {
            case 'Reference':
                result.add(SpreadsheetAddress.Key(node.Address));
                break;

            case 'Range':
                for(let row = node.Range.Start.Row; row <= node.Range.End.Row; row++)
                {
                    for(let column = node.Range.Start.Column; column <= node.Range.End.Column; column++)
                    {
                        result.add(SpreadsheetAddress.Key({ Row: row, Column: column }));
                    }
                }
                break;

            case 'Unary':
                Dependencies(node.Value, result);
                break;

            case 'Binary':
                Dependencies(node.Left, result);
                Dependencies(node.Right, result);
                break;

            case 'Call':
                for(const argument of node.Arguments)
                {
                    Dependencies(argument, result);
                }
                break;
        }

        return result;
    }

    function SpreadsheetError(code: SpreadsheetTypes.SpreadsheetErrorCode, message?: string): SpreadsheetTypes.SpreadsheetError
    {
        return { Error: true, Code: code, Message: message };
    }

    function IsError(value: SpreadsheetTypes.CellValue): value is SpreadsheetTypes.SpreadsheetError
    {
        return typeof value === 'object' && value !== null && 'Error' in value;
    }

    function NumberValue(value: SpreadsheetTypes.CellValue): number | SpreadsheetTypes.SpreadsheetError
    {
        if(IsError(value)) return value;
        if(value === null) return 0;
        if(typeof value === 'number') return value;
        if(typeof value === 'boolean') return value ? 1 : 0;
        if(value instanceof Date) return value.getTime();

        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : SpreadsheetError('#VALUE!');
    }

    function Values(node: Node, context: SpreadsheetTypes.FormulaContext): SpreadsheetTypes.CellValue[]
    {
        if(node.Kind === 'Range')
        {
            return Array.from(context.Range(node.Range));
        }

        return [Evaluate(node, context)];
    }

    export function Evaluate(node: Node, context: SpreadsheetTypes.FormulaContext): SpreadsheetTypes.CellValue
    {
        switch(node.Kind)
        {
            case 'Number': return node.Value;
            case 'String': return node.Value;
            case 'Boolean': return node.Value;
            case 'Reference': return context.Get(node.Address);
            case 'Range': return SpreadsheetError('#VALUE!', 'A range requires a function context.');

            case 'Unary':
            {
                const value = NumberValue(Evaluate(node.Value, context));
                if(IsError(value)) return value;
                return node.Operator === '-' ? -value : value;
            }

            case 'Binary':
            {
                const left = NumberValue(Evaluate(node.Left, context));
                if(IsError(left)) return left;

                const right = NumberValue(Evaluate(node.Right, context));
                if(IsError(right)) return right;

                switch(node.Operator)
                {
                    case '+': return left + right;
                    case '-': return left - right;
                    case '*': return left * right;
                    case '/': return right === 0 ? SpreadsheetError('#DIV/0!') : left / right;
                    case '^': return Math.pow(left, right);
                }
            }

            case 'Call':
            {
                const flattened = node.Arguments.flatMap(argument => Values(argument, context));

                for(const value of flattened)
                {
                    if(IsError(value)) return value;
                }

                const numbers = flattened
                    .map(NumberValue)
                    .filter((value): value is number => typeof value === 'number');

                switch(node.Name)
                {
                    case 'SUM': return numbers.reduce((sum, value) => sum + value, 0);
                    case 'AVERAGE': return numbers.length ? numbers.reduce((sum, value) => sum + value, 0) / numbers.length : SpreadsheetError('#DIV/0!');
                    case 'MIN': return numbers.length ? Math.min(...numbers) : 0;
                    case 'MAX': return numbers.length ? Math.max(...numbers) : 0;
                    case 'COUNT': return numbers.length;
                    default: return SpreadsheetError('#NAME?', `Unknown function: ${node.Name}`);
                }
            }
        }
    }
}

export default Formula;
