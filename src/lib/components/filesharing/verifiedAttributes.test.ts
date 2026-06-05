import { describe, it, expect } from 'vitest'
import {
    isWeakSenderIdentity,
    verifiedAttributesFor,
} from './verifiedAttributes'
import type { FriendlySender } from '@e4a/pg-js'

const sender = (attrs: { type: string; value?: string }[]): FriendlySender => ({
    email: attrs.find((a) => a.type.includes('email'))?.value ?? null,
    attributes: attrs,
    raw: {
        public: {
            con: attrs
                .filter((a) => a.type.includes('email'))
                .map((a) => ({ t: a.type, v: a.value })),
        },
        private: {
            con: attrs
                .filter((a) => !a.type.includes('email'))
                .map((a) => ({ t: a.type, v: a.value })),
        },
    },
})

describe('verifiedAttributesFor', () => {
    it('returns an empty list when sender is null or undefined', () => {
        expect(verifiedAttributesFor(null)).toEqual([])
        expect(verifiedAttributesFor(undefined)).toEqual([])
    })

    it('returns each non-email attribute with its i18n label key and value', () => {
        const result = verifiedAttributesFor(
            sender([
                { type: 'pbdf.sidn-pbdf.email.email', value: 'a@b.com' },
                {
                    type: 'pbdf.gemeente.personalData.fullname',
                    value: 'R.A. Hensen',
                },
                {
                    type: 'pbdf.sidn-pbdf.mobilenumber.mobilenumber',
                    value: '+31630222348',
                },
                {
                    type: 'pbdf.gemeente.personalData.dateofbirth',
                    value: '27-05-1996',
                },
            ])
        )
        expect(result).toEqual([
            {
                type: 'pbdf.gemeente.personalData.fullname',
                labelKey:
                    'filesharing.attributes.pbdf.gemeente.personalData.fullname',
                value: 'R.A. Hensen',
            },
            {
                type: 'pbdf.sidn-pbdf.mobilenumber.mobilenumber',
                labelKey:
                    'filesharing.attributes.pbdf.sidn-pbdf.mobilenumber.mobilenumber',
                value: '+31630222348',
            },
            {
                type: 'pbdf.gemeente.personalData.dateofbirth',
                labelKey:
                    'filesharing.attributes.pbdf.gemeente.personalData.dateofbirth',
                value: '27-05-1996',
            },
        ])
    })

    it('drops attributes whose value is missing or empty', () => {
        const result = verifiedAttributesFor(
            sender([
                { type: 'pbdf.sidn-pbdf.email.email', value: 'a@b.com' },
                {
                    type: 'pbdf.gemeente.personalData.fullname',
                    value: 'R.A. Hensen',
                },
                {
                    type: 'pbdf.sidn-pbdf.mobilenumber.mobilenumber',
                    value: undefined,
                },
            ])
        )
        expect(result.map((r) => r.type)).toEqual([
            'pbdf.gemeente.personalData.fullname',
        ])
    })

    it('returns an empty list when the sender only disclosed email', () => {
        const result = verifiedAttributesFor(
            sender([{ type: 'pbdf.sidn-pbdf.email.email', value: 'a@b.com' }])
        )
        expect(result).toEqual([])
    })
})

describe('isWeakSenderIdentity', () => {
    it('treats a null sender as weak', () => {
        // Defensive: if the file was not signed at all we cannot tell
        // anything about the sender, so the safest answer is "weak"
        // (the strongest warning the UI can give).
        expect(isWeakSenderIdentity(null)).toBe(true)
        expect(isWeakSenderIdentity(undefined)).toBe(true)
    })

    it('treats an email-only sender as weak', () => {
        expect(
            isWeakSenderIdentity(
                sender([
                    {
                        type: 'pbdf.sidn-pbdf.email.email',
                        value: 'a@b.com',
                    },
                ])
            )
        ).toBe(true)
    })

    it('treats a sender with any verified non-email attribute as strong', () => {
        expect(
            isWeakSenderIdentity(
                sender([
                    {
                        type: 'pbdf.sidn-pbdf.email.email',
                        value: 'a@b.com',
                    },
                    {
                        type: 'pbdf.gemeente.personalData.fullname',
                        value: 'R.A. Hensen',
                    },
                ])
            )
        ).toBe(false)
    })

    it('ignores non-email attributes whose value is empty', () => {
        // An attribute type without a value carries no signal — it must
        // not flip the gate from "weak" to "strong".
        expect(
            isWeakSenderIdentity(
                sender([
                    {
                        type: 'pbdf.sidn-pbdf.email.email',
                        value: 'a@b.com',
                    },
                    {
                        type: 'pbdf.gemeente.personalData.fullname',
                        value: undefined,
                    },
                ])
            )
        ).toBe(true)
    })
})
